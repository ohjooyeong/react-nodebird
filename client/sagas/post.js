import { all, delay, fork, put, takeLatest } from "@redux-saga/core/effects";

import {
    ADD_POST_REQUEST,
    ADD_POST_SUCCESS,
    ADD_POST_FAILURE,
    ADD_COMMENT_SUCCESS,
    ADD_COMMENT_REQUEST,
    ADD_COMMENT_FAILURE,
} from "../reducers/post";

function addPostAPI(data) {
    return axios.post("/api/post", data);
}

function* addPost(action) {
    try {
        // const result = yield call(addPostAPI, action.data);
        yield delay(1000);
        yield put({
            type: ADD_POST_SUCCESS,
            data: result.data,
        });
    } catch (error) {
        yield put({
            type: ADD_POST_FAILURE,
            data: error.response.data,
        });
    }
}

function addCommentAPI(data) {
    return axios.post(`/api/post/${data.postId}/comment`, data);
}

function* addComment(action) {
    try {
        yield delay(1000);
        yield put({
            type: ADD_COMMENT_SUCCESS,
            data: result.data,
        });
    } catch (error) {
        yield put({
            type: ADD_COMMENT_FAILURE,
            data: error.response.data,
        });
    }
}

// take는 ~~~ 액션이 실행될때까지 기다리겠다. 라는 말
function* watchAddPost() {
    yield takeLatest(ADD_POST_REQUEST, addPost);
}

function* watchAddComment() {
    yield takeLatest(ADD_COMMENT_REQUEST, addPost);
}

export default function* postSaga() {
    yield all([fork(watchAddPost), fork(watchAddComment)]);
}
