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

// Database configuration - handles both local and production
let dbConfig;

if (env === 'production') {
  // Production configuration using environment variables
  dbConfig = {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || '3306', // Default MySQL port
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  };
} else {
  // Local development configuration
  const configPath = new URL('../../config/config.json', import.meta.url);
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  dbConfig = config[env];
}

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: env === 'development' ? console.log : false,
    dialectOptions: dbConfig.dialectOptions,
    define: {
      ...(dbConfig.model || {}),
      timestamps: true, // Recommended to enable timestamps
      paranoid: true, // Optional: enables soft deletes
      underscored: true // Optional: uses snake_case for column names
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test the database connection
try {
  await sequelize.authenticate();
  console.log('Database connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
  process.exit(1); // Exit if database connection fails
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
  
  // Setup model associations
  associate(db);
  
  // Sync models with database (careful in production)
  if (env === 'development') {
    await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
  }
  
  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
};

await importModels();

export default db;