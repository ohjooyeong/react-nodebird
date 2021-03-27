const express = require("express");
const { Hashtag, Post, Image, Comment, User } = require("../models");
const { Op } = require("sequelize");

const router = express.Router();

router.get("/:hashtag", async (req, res, next) => {
    try {
        let where = {};
        if (parseInt(req.query.lastId, 10)) {
            // 초기 로딩이 아닐 때
            where.id = { [Op.lt]: parseInt(req.query.lastId, 10) }; // 라스트 아이디보다 작은 거
        }
        const posts = await Post.findAll({
            where,
            limit: 10,
            order: [
                ["createdAt", "DESC"],
                [Comment, "createdAt", "DESC"],
            ],
            include: [
                {
                    model: Hashtag,
                    where: {
                        name: decodeURIComponent(req.params.hashtag),
                    },
                },
                {
                    model: User,
                    attributes: ["id", "nickname"],
                },
                {
                    model: Image,
                },
                {
                    model: Comment,
                    include: [
                        {
                            model: User,
                            attributes: ["id", "nickname"],
                        },
                    ],
                },
                {
                    model: User, // 좋아요 누른 사람
                    as: "Likers",
                    attributes: ["id"],
                },
                {
                    model: Post,
                    as: "Retweet",
                    include: [
                        {
                            model: User,
                            attributes: ["id", "nickname"],
                        },
                        {
                            model: Image,
                        },
                    ],
                },
            ],
        });
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;
