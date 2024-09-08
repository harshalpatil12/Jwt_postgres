const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('jul22', 'postgres', 'postgres', {
    host: 'localhost',
    dialect: 'postgres'
  });

module.exports = sequelize