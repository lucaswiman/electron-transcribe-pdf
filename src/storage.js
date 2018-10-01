const Sequelize = window.require('sequelize');

function loadModels(sequelize_connection) {
  // This contains the data about the file that was loaded. This table should only have one row per database.
  const models = {};
  models.PDFData = sequelize_connection.define('pdfdata', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    name: Sequelize.STRING,
    sha256: Sequelize.STRING,
    data: Sequelize.BLOB,
    recognizedParagraphs: Sequelize.JSON,
  }
  );
  models.Page = sequelize_connection.define('page', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    pageNumber: Sequelize.INTEGER,
    recognizedParagraphs: Sequelize.JSON,
  });
  models.Page.belongsTo(models.PDFData);

  return models;
}

module.exports = loadModels;