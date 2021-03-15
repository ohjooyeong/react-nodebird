import Head from "next/head";
import AppLayout from "../components/AppLayout";
import NicknameEditForm from "../components/NicknameEditForm";
import FollowList from "../components/FollowList";

const Profile = () => {
    const followerList = [{ nickname: "오주영" }, { nickname: "인생" }, { nickname: "게임" }];
    const follwingList = [{ nickname: "오주영" }, { nickname: "인생" }, { nickname: "게임" }];
    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <title>프로필 | NodeBird</title>
            </Head>
            <AppLayout>
                <NicknameEditForm />
                <FollowList header="팔로잉 목록" data={follwingList} />
                <FollowList header="팔로워 목록" data={followerList} />
            </AppLayout>
        </>
    );
};

export default Profile;
