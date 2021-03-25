import { all, delay, fork, put, takeLatest, call } from "@redux-saga/core/effects";
import axios from "axios";

import {
    ADD_POST_REQUEST,
    ADD_POST_SUCCESS,
    ADD_POST_FAILURE,
    ADD_COMMENT_SUCCESS,
    ADD_COMMENT_REQUEST,
    ADD_COMMENT_FAILURE,
    REMOVE_POST_REQUEST,
    REMOVE_POST_SUCCESS,
    REMOVE_POST_FAILURE,
    LOAD_POSTS_REQUEST,
    LOAD_POSTS_SUCCESS,
    LOAD_POSTS_FAILURE,
    LIKE_POST_REQUEST,
    LIKE_POST_SUCCESS,
    LIKE_POST_FAILURE,
    UNLIKE_POST_REQUEST,
    UNLIKE_POST_SUCCESS,
    UNLIKE_POST_FAILURE,
    UPLOAD_IMAGES_REQUEST,
    UPLOAD_IMAGES_SUCCESS,
    UPLOAD_IMAGES_FAILURE,
    RETWEET_REQUEST,
    RETWEET_SUCCESS,
    RETWEET_FAILURE,
} from "../reducers/post";
import { ADD_POST_TO_ME, REMOVE_POST_OF_ME } from "../reducers/user";

function retweetAPI(data) {
    return axios.post(`/post/${data}/retweet`);
}

function* retweet(action) {
    try {
        const result = yield call(retweetAPI, action.data);
        yield put({
            type: RETWEET_SUCCESS,
            data: result.data,
        });
    } catch (error) {
        console.error(error);
        yield put({
            type: RETWEET_FAILURE,
            error: error.response.data,
        });
    }
}

function uploadImagesAPI(data) {
    return axios.post(`/post/images`, data);
}

function* uploadImages(action) {
    try {
        const result = yield call(uploadImagesAPI, action.data);
        yield put({
            type: UPLOAD_IMAGES_SUCCESS,
            data: result.data,
        });
    } catch (error) {
        console.error(error);
        yield put({
            type: UPLOAD_IMAGES_FAILURE,
            error: error.response.data,
        });
    }
}

function likePostAPI(data) {
    return axios.patch(`/post/${data}/like`);
}

function* likePost(action) {
    try {
        const result = yield call(likePostAPI, action.data);
        yield put({
            type: LIKE_POST_SUCCESS,
            data: result.data,
        });
    } catch (error) {
        console.error(error);
        yield put({
            type: LIKE_POST_FAILURE,
            error: error.response.data,
        });
    }
}

function unlikePostAPI(data) {
    return axios.delete(`/post/${data}/unlike`);
}

function* unlikePost(action) {
    try {
        const result = yield call(unlikePostAPI, action.data);
        yield put({
            type: UNLIKE_POST_SUCCESS,
            data: result.data,
        });
    } catch (error) {
        console.error(error);
        yield put({
            type: UNLIKE_POST_FAILURE,
            error: error.response.data,
        });
    }
}

function loadPostsAPI(lastId) {
    return axios.get(`/posts?lastId=${lastId || 0}`);
}

function* loadPosts(action) {
    try {
        const result = yield call(loadPostsAPI, action.lastId);
        yield put({
            type: LOAD_POSTS_SUCCESS,
            data: result.data,
        });
    } catch (error) {
        console.error(error);
        yield put({
            type: LOAD_POSTS_FAILURE,
            error: error.response.data,
        });
    }
}

function addPostAPI(data) {
    return axios.post("/post", data);
}

function* addPost(action) {
    try {
        const result = yield call(addPostAPI, action.data);
        yield put({
            type: ADD_POST_SUCCESS,
            data: result.data,
        });
        yield put({
            type: ADD_POST_TO_ME,
            data: result.data.id,
        });
    } catch (error) {
        console.error(error);
        yield put({
            type: ADD_POST_FAILURE,
            error: error.response.data,
        });
    }
}

function removePostAPI(data) {
    return axios.delete(`/post/${data}`);
}

function* removePost(action) {
    try {
        const result = yield call(removePostAPI, action.data);
        yield put({
            type: REMOVE_POST_SUCCESS,
            data: result.data,
        });
        yield put({
            type: REMOVE_POST_OF_ME,
            data: action.data,
        });
    } catch (error) {
        console.error(error);
        yield put({
            type: REMOVE_POST_FAILURE,
            error: error.response.data,
        });
    }
}

function addCommentAPI(data) {
    return axios.post(`/post/${data.postId}/comment`, data);
}

function* addComment(action) {
    try {
        const result = yield call(addCommentAPI, action.data);
        yield put({
            type: ADD_COMMENT_SUCCESS,
            data: result.data,
        });
    } catch (error) {
        console.error(error);
        yield put({
            type: ADD_COMMENT_FAILURE,
            error: error.response.data,
        });
    }
}

function* watchRetweet() {
    yield takeLatest(RETWEET_REQUEST, retweet);
}

function* watchUploadImages() {
    yield takeLatest(UPLOAD_IMAGES_REQUEST, uploadImages);
}

function* watchLikePost() {
    yield takeLatest(LIKE_POST_REQUEST, likePost);
}

function* watchUnlikePost() {
    yield takeLatest(UNLIKE_POST_REQUEST, unlikePost);
}

function* watchLoadPost() {
    yield takeLatest(LOAD_POSTS_REQUEST, loadPosts);
}

// take는 ~~~ 액션이 실행될때까지 기다리겠다. 라는 말
function* watchAddPost() {
    yield takeLatest(ADD_POST_REQUEST, addPost);
}

function* watchRemovePost() {
    yield takeLatest(REMOVE_POST_REQUEST, removePost);
}

function* watchAddComment() {
    yield takeLatest(ADD_COMMENT_REQUEST, addComment);
}

export default function* postSaga() {
    yield all([
        fork(watchRetweet),
        fork(watchUploadImages),
        fork(watchLikePost),
        fork(watchUnlikePost),
        fork(watchAddPost),
        fork(watchRemovePost),
        fork(watchAddComment),
        fork(watchLoadPost),
    ]);
}
