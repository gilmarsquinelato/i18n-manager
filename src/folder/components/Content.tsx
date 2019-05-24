import { Button, Card, Col, Form, Input, Row } from 'antd';
import _ from 'lodash';
import React from 'react';

import { ParsedFile } from '../../../typings';
import styles from './Content.module.scss';


interface IContentProps {
  folder: ParsedFile[];
  openedPath: string[];
}

const getLanguageLabel = (language: string): string => {
  const localeLabel = getLocaleLabel(language);
  if (!localeLabel) {
    return language;
  }

  return `${localeLabel} - ${language}`;
};

const Content: React.FC<IContentProps> = ({folder, openedPath}) => {
  return (
    <>
      {folder.map((item, index) => (
        <Card key={item.language + item.fileName} className={styles.Card}>
          <Row type="flex" align="middle">
            <Col span={2}>
              <Button shape="circle" type="primary">{index + 1}</Button>
            </Col>
            <Col span={20}>
              <Form.Item label={item.language}>
                <Input/>
              </Form.Item>
            </Col>
            {/*{item.language}*/}
            {/*{' '}*/}
            {/*{item.fileName}*/}
            {/*{' '}*/}
            {/*{_.get(item.data, openedPath)}*/}
          </Row>
        </Card>
      ))}
    </>
  );
};

export default Content;
