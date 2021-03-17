import { all, delay, fork, put, takeLatest } from "@redux-saga/core/effects";
import axios from "axios";

// call은 동기함수 호출 promise형식이고
// fork는 비동기함수 호출 이건 그냥 함수 형식
import {
    LOG_IN_FAILURE,
    LOG_IN_REQUEST,
    LOG_IN_SUCCESS,
    LOG_OUT_FAILURE,
    LOG_OUT_REQUEST,
    LOG_OUT_SUCCESS,
    SIGN_UP_FAILURE,
    SIGN_UP_REQUEST,
    SIGN_UP_SUCCESS,
} from "../reducers/user";

function logInAPI(data) {
    return axios.post("/api/login", data);
}

function* logIn(action) {
    try {
        // const result = yield call(logInAPI, action.data);

        yield delay(1000);
        yield put({
            type: LOG_IN_SUCCESS,
            data: action.data,
        });
    } catch (error) {
        yield put({
            type: LOG_IN_FAILURE,
            data: error.response.data,
        });
    }
}

function logOutAPI() {
    return axios.post("/api/logout");
}

function* logOut() {
    try {
        yield delay(1000);
        yield put({
            type: LOG_OUT_SUCCESS,
        });
    } catch (error) {
        yield put({
            type: LOG_OUT_FAILURE,
            data: error.response.data,
        });
    }
}

function signUpAPI() {
    return axios.post("/api/logout");
}

function* signUp(action) {
    try {
        yield delay(1000);
        yield put({
            type: SIGN_UP_SUCCESS,
            data: result.data,
        });
    } catch (error) {
        yield put({
            type: SIGN_UP_FAILURE,
            data: error.response.data,
        });
    }
}

function* watchLogin() {
    yield takeLatest(LOG_IN_REQUEST, logIn);
}

function* watchLogOut() {
    yield takeLatest(LOG_OUT_REQUEST, logOut);
}

function* watchSignUp() {
    yield takeLatest(SIGN_UP_REQUEST, signUp);
}

export default function* userSaga() {
    yield all([fork(watchLogin), fork(watchLogOut), fork(watchSignUp)]);
}
