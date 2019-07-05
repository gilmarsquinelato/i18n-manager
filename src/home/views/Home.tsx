import { navigate, RouteComponentProps } from '@reach/router';
import { Card, Col, Layout, List, Row, Tooltip } from 'antd';
import React, { useCallback } from 'react';

import RemoteLink from '@src/components/RemoteLink';
import { actions as folderActions } from '@src/folder/store';
import { useAction, useStoreState } from '@src/store';
import { IFormattedFolderPath } from '@typings/index';
import styles from './Home.module.scss';


const RELEASES_TAG_URL = `https://github.com/gilmarsquinelato/i18n-manager/releases/tag`;

const Home: React.FC<RouteComponentProps> = () => {
  const recentFolders = useStoreState(state => state.home.recentFolders);
  const currentVersion = useStoreState(state => state.home.currentVersion);
  const latestVersion = useStoreState(state => state.home.latestVersion);

  const loadFolder = useAction(folderActions.loadFolder);

  const handleOpenFolder = useCallback(
    (e: React.MouseEvent, item: IFormattedFolderPath) => {
      e.preventDefault();

      loadFolder(item.fullPath);
      navigate('/folder');
    },
    [loadFolder]);

  return (
    <Layout className={styles.Container}>
      <Layout.Content className={styles.Content}>
        <h1 className={styles.Title}>i18n Manager</h1>

        <Row gutter={16} className={styles.CardList}>
          <Col span={12}>
            <Card title="Recent folders">
              <List
                size="small"
                dataSource={recentFolders}
                renderItem={item => (
                  <List.Item>
                    <Col span={24} className={styles.RecentFolder}>
                      <a href="/" onClick={e => handleOpenFolder(e, item)}>{item.folder}</a>
                      <Tooltip title={item.path} mouseEnterDelay={1}>
                        <span>{item.path}</span>
                      </Tooltip>
                    </Col>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col span={10}>
            <Card title="Version">
              <Row>Current version: {currentVersion}</Row>
              {latestVersion.length > 0 && currentVersion !== latestVersion && (
                <Row>
                  <strong>New version available ({latestVersion})!</strong>
                  {' '}
                  <RemoteLink href={`${RELEASES_TAG_URL}/${latestVersion}`}>
                    Download
                  </RemoteLink>
                </Row>
              )}
            </Card>
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  );
};

export default Home;
