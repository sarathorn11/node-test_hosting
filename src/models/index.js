import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath } from 'url';
import associate from './associations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const db = {};
const env = process.env.NODE_ENV || 'development';

// Database configuration
let sequelize;
try {
  if (env === 'production') {
    // Production configuration (Render)
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required in production');
    }
    
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      retry: {
        max: 3, // Maximum number of retries
        match: [
          /ECONNREFUSED/,
          /ETIMEDOUT/,
          Sequelize.ConnectionError
        ],
      }
    });
  } else {
    // Local development configuration
    const configPath = new URL('../../config/config.json', import.meta.url);
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    const dbConfig = config[env];
    
    // Validate local configuration
    if (!dbConfig) {
      throw new Error(`No database configuration found for environment: ${env}`);
    }
    if (!dbConfig.database || !dbConfig.username) {
      throw new Error('Database name and username are required in config');
    }

    // Default to standard MySQL port if not specified
    const port = dbConfig.port || 3306;
    
    sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host || 'localhost',
        port: port,
        dialect: dbConfig.dialect || 'mysql',
        logging: console.log,
        define: {
          ...(dbConfig.model || {}),
        },
        retry: {
          max: 3,
          match: [
            /ECONNREFUSED/,
            /ETIMEDOUT/,
            Sequelize.ConnectionError
          ],
        }
      }
    );
  }

  // Test database connection with timeout
  await sequelize.authenticate({ timeout: 5000 });
  console.log('Database connection established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
  
  // Provide helpful error messages
  if (error.code === 'ECONNREFUSED') {
    console.error('\nConnection refused. Please check:');
    console.error('- Is MySQL server running?');
    console.error(`- Is it accessible at ${sequelize?.config?.host || 'localhost'}:${sequelize?.config?.port || '3306'}?`);
    console.error('- Are your credentials correct?');
  } else if (error instanceof Sequelize.ConnectionError) {
    console.error('\nDatabase connection error:', error.message);
  }
  
  process.exit(1);
}

const importModels = async () => {
  const files = readdirSync(__dirname).filter(
    (file) => file !== basename && file.slice(-3) === '.js' && !file.includes('.test.js')
  );
  
  try {
    await Promise.all(
      files.map(async (file) => {
        if (file === 'associations.js') return;
        const modelPath = path.join(__dirname, file);
        const { default: model } = await import(`file://${modelPath}`);
        const sequelizeModel = model(sequelize, DataTypes);
        db[sequelizeModel.name] = sequelizeModel;
      })
    );
  } catch (error) {
    console.error('Error importing models:', error);
    throw error; // Re-throw to prevent further execution
  }
  
  // Setup associations if models loaded successfully
  if (Object.keys(db).length > 0) {
    associate(db);
  } else {
    console.warn('No models were loaded - skipping associations');
  }
  
  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
};

try {
  await importModels();
} catch (error) {
  console.error('Failed to initialize models:', error);
  process.exit(1);
}

export default db;