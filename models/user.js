module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      reminders: {
        type: DataTypes.STRING,
        allowNull: false,
        datatime: DataTypes 
      }
    });
    
    return User;
  };
  