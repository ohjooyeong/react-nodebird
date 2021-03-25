const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { User, Post } = require("../models");
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
            res.status(200).json(fullUserWithoutPassword);
        } else {
            res.status(200).json(null);
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// POST /user/login
// 미들웨어 확장방법
router.post("/login", isNotLoggedIn, (req, res, next) => {
    console.log("여기");
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
            return res.status(200).send("존재하지 않는 사람을 찾으려고 하시네요");
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
            return res.status(200).send("존재하지 않는 사람을 찾으려고 하시네요");
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
            return res.status(200).send("없는 사람을 차단하려고 하시네요");
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
            return res.status(200).send("존재하지 않는 사람을 찾으려고 하시네요");
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
            return res.status(200).send("존재하지 않는 사람을 찾으려고 하시네요");
        }
        const followings = await user.getFollowings();
        return res.status(200).json(followings);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;