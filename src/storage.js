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
    data: Sequelize.BLOB,
  }
  );

  models.RecognizedParagraph = sequelize_connection.define('recognizedparagraph', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    position: Sequelize.INTEGER,
    value: Sequelize.TEXT,
    metadata: Sequelize.JSON,
  });


  models.RecognizedLine = sequelize_connection.define('recognizedline', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    position: Sequelize.INTEGER,
    value: Sequelize.TEXT,
    metadata: Sequelize.JSON,
    });
  models.RecognizedLine.belongsTo(models.RecognizedParagraph);

  models.RecognizedWord = sequelize_connection.define('recognizedword', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    position: Sequelize.INTEGER,
    value: Sequelize.TEXT,
    metadata: Sequelize.JSON,
  });
  models.RecognizedWord.belongsTo(models.RecognizedLine);

  return models;
}

module.exports = loadModels;