module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return user;
};