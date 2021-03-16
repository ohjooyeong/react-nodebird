import { HYDRATE } from "next-redux-wrapper";
import user from "./user";
import post from "./post";
import { combineReducers } from "redux";

const initialState = {
    user: {},
    post: {},
};

// (이전상태, 액션) => 다음 상태
const rootReducer = combineReducers({
    // HYDRATE라고 SSR을 위해 index 리듀서를 넣어줘야한다. 보통 리액트면 안넣어도됨
    index: (state = {}, action) => {
        switch (action.type) {
            case HYDRATE:
                return { ...state, ...action.payload };

            default:
                return state;
        }
    },
    user,
    post,
});

export default rootReducer;
