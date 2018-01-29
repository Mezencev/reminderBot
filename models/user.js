module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true
      },
      reminders: {
        type: DataTypes.STRING
        
      },
      date: {
        type: DataTypes.DATE
      }
    });
    
    return User;
  };
  