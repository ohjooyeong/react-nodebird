export const initialState = {
    mainPosts: [
        {
            id: 1,
            User: {
                id: 1,
                nickname: "ohzz",
            },
            content: "첫 번째 게시글 #해시태그 #익스프레스",
            Images: [
                {
                    src: "https://i.pinimg.com/564x/09/4c/27/094c27bb93bec23a4ce2f22fd5c0758e.jpg",
                },
                {
                    src: "https://i.pinimg.com/564x/d6/52/e9/d652e967b6b2579f2b2078b5974a9f8a.jpg",
                },
                {
                    src: "https://i.pinimg.com/564x/d6/52/e9/d652e967b6b2579f2b2078b5974a9f8a.jpg",
                },
            ],
            Comments: [
                {
                    User: {
                        nickname: "ohoh",
                    },
                    content: "오우",
                },
            ],
        },
    ],
    imagePaths: [],
    postAdded: false,
};

const ADD_POST = "ADD_POST";

export const addPostAction = {
    type: ADD_POST,
};

const dummyPost = {
    id: 2,
    content: "더미데이터입니다",
    User: {
        id: 1,
        nickname: "ohzz",
    },
    Images: [],
    Comments: [],
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_POST:
            return {
                ...state,
                mainPosts: [dummyPost, ...state.mainPosts],
                postAdded: true,
            };
        default:
            return state;
    }
};

export default reducer;
