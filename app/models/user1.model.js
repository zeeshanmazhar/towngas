module.exports = (sequelize, Sequelize, DataTypes) => {
    const User1 = sequelize.define(
      "user1",
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        wallet_address: {
          type: DataTypes.STRING,
          unique: true
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

    return User1;
  };
