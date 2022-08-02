module.exports = (sequelize, Sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING,
        unique: true
      },
      name:{
        type: DataTypes.STRING,
        defaultValue:""
      },
      phone: {
        type: DataTypes.STRING,
        unique: true
      },
      password:{
        type: DataTypes.STRING,
        defaultValue:""
      },
      wallet_address: {
        type: DataTypes.STRING,
        unique: true
      },
      order_no: {
        type: DataTypes.STRING,
        defaultValue:""
      },
      purchase_date: {
        type: DataTypes.STRING,
        defaultValue:""
      },
      role: {
        type: DataTypes.STRING,
        defaultValue:"user"
      },
      nft_one: {
        type: DataTypes.INTEGER,
        defaultValue:0
      },
      nft_two: {
        type: DataTypes.INTEGER,
        defaultValue:0
      },
    },
    {
      // Options
      timestamps: true,
      underscrored: true,
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  );

  return User;
};
