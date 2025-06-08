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
if (env === 'production') {
  // Production configuration (Render)
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
    }
  });
} else {
  // Local development configuration
  const configPath = new URL('../../config/config.json', import.meta.url);
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const dbConfig = config[env];
  
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: console.log,
      define: {
        ...(dbConfig.model || {}),
      }
    }
  );
}

// Test database connection
try {
  await sequelize.authenticate();
  console.log('Database connection established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
  process.exit(1);
}

const importModels = async () => {
  const files = readdirSync(__dirname).filter(
    (file) => file !== basename && file.slice(-3) === '.js'
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
  }
  
  associate(db);
  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
};

await importModels();

export default db;