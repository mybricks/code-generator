import React from "react";
import {
  Input,
  Select,
  Form,
  Row,
  Col,
  Button,
  Space,
  Card,
  Dropdown,
  Menu,
} from "antd";
import "antd/dist/antd.css";
import { EllipsisOutlined } from "@ant-design/icons";

export default function () {
  return (
    <div>
      <div style={{ display: "block", height: "auto", width: "100%" }}>
        <div>
          <Card
            title="卡片21323"
            size="default"
            bordered={true}
            style={{
              display: "block",
              height: "100%",
              width: "100%",
              cursor: "unset",
            }}
            extra={undefined}
            hoverable={false}
          >
            <div style={{ display: "block", width: "100%" }}>
              <Form layout="horizontal" labelCol={{ flex: "0 0 98px" }}>
                <Row>
                  <Col style={{ width: "100%" }}>
                    <Form.Item label="表单项0" name="表单项0">
                      <div style={{ display: "block", width: "100%" }}>
                        <Input
                          type="text"
                          allowClear={true}
                          placeholder="请输入内容"
                          disabled={false}
                          showCount={false}
                          maxLength={-1}
                        />
                      </div>
                    </Form.Item>
                  </Col>
                  <Col style={{ width: "100%" }}>
                    <Form.Item label="表单项1" name="表单项1">
                      <div style={{ display: "block", width: "100%" }}>
                        <div style={{}}>
                          <Select
                            disabled={false}
                            placeholder="请选择"
                            mode="default"
                            showSearch={true}
                            filterOption={true}
                            optionFilterProp="label"
                          />
                        </div>
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
                <Col
                  flex="0 0 100%"
                  style={{
                    textAlign: "left",
                  }}
                >
                  <Form.Item label=" " colon={false}>
                    <Space wrap>
                      <Button type="primary">提交</Button>
                      <Button>取消</Button>
                    </Space>
                  </Form.Item>
                </Col>
              </Form>
            </div>
          </Card>
        </div>
      </div>

      <div style={{ display: "block", width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            flexFlow: "row wrap",
            justifyContent: "flex-start",
            gap: "4px 4px",
          }}
        >
          <Button size="" type="" shape="">
            按钮0
          </Button>
          <Button size="" type="" shape="">
            按钮1
          </Button>
          <Button size="" type="" shape="">
            按钮2
          </Button>
        </div>
      </div>
    </div>
  );
}
