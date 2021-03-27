const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { Op } = require("sequelize");
const { User, Post, Image, Comment } = require("../models");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

const router = express.Router();

// 로그인 정보 유지
router.get("/", async (req, res, next) => {
    try {
        if (req.user) {
            const fullUserWithoutPassword = await User.findOne({
                where: { id: req.user.id },
                attributes: {
                    // password만 빼고 다 받아옴
                    exclude: ["password"],
                },
                include: [
                    // 이걸 포함해서 User 테이블을 받아옴
                    {
                        model: Post,
                        attributes: ["id"],
                    },
                    {
                        model: User,
                        as: "Followings",
                        attributes: ["id"],
                    },
                    {
                        model: User,
                        as: "Followers",
                        attributes: ["id"],
                    },
                ],
            });
            return res.status(200).json(fullUserWithoutPassword);
        } else {
            return res.status(200).json(null);
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// POST /user/login
// 미들웨어 확장방법
router.post("/login", isNotLoggedIn, (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.error(err);
            return next(err);
        }
        if (info) {
            return res.status(401).send(info.reason);
        }
        return req.login(user, async (loginErr) => {
            if (loginErr) {
                console.error(loginErr);
                return next(loginErr);
            }
            const fullUserWithoutPassword = await User.findOne({
                where: { id: user.id },
                attributes: {
                    // password만 빼고 다 받아옴
                    exclude: ["password"],
                },
                include: [
                    // 이걸 포함해서 User 테이블을 받아옴
                    {
                        model: Post,
                    },
                    {
                        model: User,
                        as: "Followings",
                    },
                    {
                        model: User,
                        as: "Followers",
                    },
                ],
            });
            return res.status(200).json(fullUserWithoutPassword);
        });
    })(req, res, next);
});

router.post("/", isNotLoggedIn, async (req, res, next) => {
    // POST /user
    try {
        const exUser = await User.findOne({
            where: {
                email: req.body.email,
            },
        });
        if (exUser) {
            return res.status(403).send("이미 사용 중인 아이디입니다.");
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await User.create({
            email: req.body.email,
            nickname: req.body.nickname,
            password: hashedPassword,
        });
        res.status(201).send("ok");
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get("/:userId/posts", async (req, res, next) => {
    try {
        let where = { UserId: req.params.userId };
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

router.post("/logout", isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.send("ok");
});

router.patch("/nickname", isLoggedIn, async (req, res, next) => {
    try {
        await User.update(
            {
                nickname: req.body.nickname,
            },
            {
                where: { id: req.user.id },
            }
        );
        return res.status(200).json({ nickname: req.body.nickname });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.patch("/:userId/follow", isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.params.userId } });
        if (!user) {
            return res.status(403).send("존재하지 않는 사람을 찾으려고 하시네요");
        }
        await user.addFollowers(req.user.id);
        return res.status(200).json({ UserId: Number(req.params.userId) });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.delete("/:userId/follow", isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.params.userId } });
        if (!user) {
            return res.status(403).send("존재하지 않는 사람을 찾으려고 하시네요");
        }
        await user.removeFollowers(req.user.id);
        return res.status(200).json({ UserId: Number(req.params.userId) });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.delete("/follower/:userId", isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.params.userId } });
        if (!user) {
            return res.status(403).send("없는 사람을 차단하려고 하시네요");
        }
        await user.removeFollowings(req.user.id);
        return res.status(200).json({ UserId: Number(req.params.userId) });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get("/followers", isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user) {
            return res.status(403).send("존재하지 않는 사람을 찾으려고 하시네요");
        }
        const followers = await user.getFollowers();
        return res.status(200).json(followers);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get("/followings", isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user) {
            return res.status(403).send("존재하지 않는 사람을 찾으려고 하시네요");
        }
        const followings = await user.getFollowings();
        return res.status(200).json(followings);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get("/:userId", async (req, res, next) => {
    try {
        const fullUserWithoutPassword = await User.findOne({
            where: { id: req.params.userId },
            attributes: {
                // password만 빼고 다 받아옴
                exclude: ["password"],
            },
            include: [
                // 이걸 포함해서 User 테이블을 받아옴
                {
                    model: Post,
                    attributes: ["id"],
                },
                {
                    model: User,
                    as: "Followings",
                    attributes: ["id"],
                },
                {
                    model: User,
                    as: "Followers",
                    attributes: ["id"],
                },
            ],
        });
        if (fullUserWithoutPassword) {
            const data = fullUserWithoutPassword.toJSON();
            data.Posts = data.Posts.length; //개인정보 침해 예방
            data.Followers = data.Followers.length;
            data.Followings = data.Followings.length;
            return res.status(200).json(data);
        } else {
            return res.status(200).json("존재하지 않는 사용자입니다");
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;
