import React, { useMemo } from "react";
import { Button, Card, List } from "antd";
import { StopOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { UNFOLLOW_REQUEST, REMOVE_FOLLOWER_REQUEST } from "../reducers/user";

const ListItem = styled(List.Item)`
    margin-top: 20px;
`;

const FollowList = ({ header, data }) => {
    const dispatch = useDispatch();
    const ListInStyle = useMemo(() => ({
        marginBottom: "20px",
    }));
    const ListInGrid = useMemo(() => ({ gutter: 4, xs: 2, md: 3 }));
    const ListInDivStyle = useMemo(() => ({ textAlign: "center", margin: "10px 0 " }));

    const onCancel = (id) => () => {
        if (header === "팔로잉 목록") {
            dispatch({
                type: UNFOLLOW_REQUEST,
                data: id,
            });
        } else {
            dispatch({
                type: REMOVE_FOLLOWER_REQUEST,
                data: id,
            });
        }
    };
    return (
        <List
            style={ListInStyle}
            grid={ListInGrid}
            size="small"
            header={<div>{header}</div>}
            loadMore={
                <div style={ListInDivStyle}>
                    <Button>더 보기</Button>
                </div>
            }
            bordered
            dataSource={data}
            renderItem={(item) => (
                <ListItem>
                    <Card actions={[<StopOutlined key="stop" onClick={onCancel(item.id)} />]}>
                        <Card.Meta description={item.nickname} />
                    </Card>
                </ListItem>
            )}
        />
    );
};

FollowList.propTypes = {
    header: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
};

export default FollowList;
