import React from 'react';
import { Card, Col, Layout, List, Row } from 'antd';
import { Link, RouteComponentProps } from '@reach/router';

import { useStore } from '../../store';
import styles from './Home.module.scss';


const Home: React.FC<RouteComponentProps> = () => {
  const recentFolders = useStore(state => state.home.recentFolders);

  return (
    <Layout className={styles.Container}>
      <Layout.Content>
        <h1>i18n Manager</h1>

        <Row>
          <Col span={12}>
            <Card title="Recent folders">
              <List
                size="small"
                dataSource={recentFolders}
                renderItem={item => (
                  <List.Item>
                    <Col span={24} className={styles.RecentFolder}>
                      <Link to={`/folder?path="${item.fullPath}"`}>{item.folder}</Link>
                      <span>{item.path}</span>
                    </Col>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  );
};

export default Home;
