const express = require("express");
const { Post, Comment, Image, User } = require("../models");
const { isLoggedIn } = require("./middlewares");

const router = express.Router();

router.post("/", isLoggedIn, async (req, res) => {
    try {
        const post = await Post.create({
            content: req.body.content,
            UserId: req.user.id,
        });
        const fullPost = await Post.findOne({
            where: { id: post.id },
            include: [
                {
                    model: Image,
                },
                {
                    model: Comment,
                    include: [
                        {
                            model: User, // 댓글 작성자
                            attributes: ["id", "nickname"],
                        },
                    ],
                },
                {
                    model: User, // 게시글 작성자
                    attributes: ["id", "nickname"],
                },
                {
                    model: User, // 좋아요 누른 사람
                    as: "Likers",
                    attributes: ["id"],
                },
            ],
        });
        res.status(201).json(fullPost);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.post("/:postId/comment", isLoggedIn, async (req, res) => {
    try {
        const post = await Post.findOne({
            where: { id: req.params.postId },
        });
        if (!post) {
            return res.status(403).send("존재하지 않는 게시글입니다.");
        }
        const comment = await Comment.create({
            content: req.body.content,
            PostId: Number(req.params.postId),
            UserId: req.user.id,
        });
        const fullComment = await Comment.findOne({
            where: { id: comment.id },
            include: [
                {
                    model: User,
                    attributes: ["id", "nickname"],
                },
            ],
        });
        res.status(201).json(fullComment);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.patch("/:postId/like", async (req, res, next) => {
    try {
        const post = await Post.findOne({ where: { id: req.params.postId } });
        if (!post) {
            return res.status(403).send("게시글이 존재하지 않습니다.");
        }
        await post.addLikers(req.user.id);
        return res.status(201).json({ PostId: post.id, UserId: req.user.id });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.delete("/:postId/unlike", async (req, res, next) => {
    try {
        const post = await Post.findOne({ where: { id: req.params.postId } });
        if (!post) {
            return res.status(403).send("게시글이 존재하지 않습니다.");
        }
        await post.removeLikers(req.user.id);
        return res.status(200).json({ PostId: post.id, UserId: req.user.id });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.delete("/", (req, res) => {
    res.json({ id: 1 });
});

module.exports = router;
