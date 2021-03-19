module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define(
        "Comment", // MySQL에는 comments 테이블 생성
        {
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
        },
        // UserId: 1,
        // PostId: 3
        {
            charset: "utf8mb4",
            collate: "utf8mb4_general_ci", // 한글 이모티콘 저장
        }
    );
    Comment.associate = (db) => {
        db.Comment.belongsTo(db.User);
        db.Comment.belongsTo(db.Post);
    };
    return Comment;
};
