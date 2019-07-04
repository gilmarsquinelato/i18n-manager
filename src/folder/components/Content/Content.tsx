import { Button, Card, Col, Dropdown, Form, Input, Row, Select } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useBoolean, useInput } from 'react-hanger';

import { ILoadedPath } from '@typings/index';
import {
  containsLanguage,
  getContentFromPath,
  getLanguageLabel,
  getParsedFiles,
} from '../../functions';
import { IContentItem, ILanguageListItem, ITranslatePayload, ITreeItem } from '../../types';
import styles from './Content.module.scss';


interface IContentProps {
  folder: ILoadedPath[];
  originalFolder: ILoadedPath[];
  selectedItem: ITreeItem;
  onChange: (value: string, index: number, itemId: string) => void;
  onMouseUp: (itemId: string, e: React.MouseEvent) => void;
  languageList: ILanguageListItem[];
  supportedLanguages: string[];
  onTranslate: (payload: ITranslatePayload) => void;
}

const Content = React.memo<IContentProps>(
  ({
     folder,
     originalFolder,
     selectedItem,
     onChange,
     onMouseUp,
     languageList,
     supportedLanguages,
     onTranslate,
   }) => {
    const selectedItemPath = selectedItem.path;
    const contextLanguages = useMemo(
      () => getParsedFiles(folder, selectedItemPath).map(it => it.language),
      [folder, selectedItemPath],
    );
    const filteredLanguageList = useMemo(
      () => languageList
        .filter(it =>
          contextLanguages.includes(it.language) &&
          containsLanguage(supportedLanguages, it.language)),
      [languageList, contextLanguages],
    );

    const data = useMemo(
      () => getContentFromPath(folder, selectedItemPath),
      [folder, selectedItemPath],
    );
    const originalData = useMemo(
      () => getContentFromPath(originalFolder, selectedItemPath),
      [originalFolder, selectedItemPath],
    );

    return (
      <>
        {data.map((item, index) => (
          <ContentItem
            key={item.language}
            item={item}
            treeItem={selectedItem}
            originalItem={originalData[index]}
            index={index}
            onChange={onChange}
            onMouseUp={onMouseUp}
            languageList={filteredLanguageList}
            onTranslate={onTranslate}
          />
        ))}
      </>
    );
  });

export default Content;

interface IContentItemProps {
  item: IContentItem;
  treeItem: ITreeItem;
  originalItem: IContentItem;
  index: number;
  onChange: (value: string, index: number, itemId: string) => void;
  onMouseUp: (itemId: string, e: React.MouseEvent) => void;
  languageList: ILanguageListItem[];
  onTranslate: (payload: ITranslatePayload) => void;
}

const ContentItem = React.memo<IContentItemProps>(
  ({
     item,
     originalItem,
     treeItem,
     index,
     onChange,
     onMouseUp,
     languageList,
     onTranslate,
   }) => {
    const translationPanelOpen = useBoolean(false);
    const [inputValue, setValue] = useState();

    const status = getItemStatus(item, originalItem);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      onChange(e.target.value, index, treeItem.id);
    };

    const handleTranslate = (sourceLanguage: string) => {
      translationPanelOpen.setFalse();
      onTranslate({
        sourceLanguage,
        targetLanguages: [item.language],
        mode: 'this',
        overwrite: true,
      });
    };

    useEffect(() => {
      setValue(item.value);
    }, [item, setValue]);

    return (
      <Card className={styles.Card}>
        <Row type="flex" align="middle">
          <Col span={2}>
            <Button shape="circle" type="primary" tabIndex={-1}>{index + 1}</Button>
          </Col>
          <Col span={20}>
            <Form.Item
              label={getLanguageLabel(item.language)}
              colon={false}
              validateStatus={status}
            >
              <Input
                value={inputValue}
                onChange={handleChange}
                onMouseUp={e => onMouseUp(treeItem.id, e)}
              />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Dropdown
              className={styles.TranslateFieldButton}
              overlay={
                <LanguageMenu
                  currentLanguage={item.language}
                  languageList={languageList}
                  onTranslate={handleTranslate}
                />
              }
              trigger={['click']}
              placement="bottomLeft"
              visible={translationPanelOpen.value}
              onVisibleChange={translationPanelOpen.setValue}
            >
              <Button icon="more" shape="circle" tabIndex={-1}/>
            </Dropdown>
          </Col>
        </Row>
      </Card>
    );
  });

interface ILanguageMenuProps {
  currentLanguage: string;
  languageList: ILanguageListItem[];
  onTranslate: (language: string) => void;
}

const LanguageMenu = React.memo<ILanguageMenuProps>(
  ({currentLanguage, languageList, onTranslate}) => {
    const language = useInput();

    const languageOptions = languageList
      .filter(it => it.language !== currentLanguage)
      .map(it => (
        <Select.Option value={it.language} key={it.language + it.label}>
          {it.label}
        </Select.Option>
      ));

    return (
      <Card title="Translate this field from">
        <Row>
          <Select
            placeholder="Select a language"
            showSearch
            style={{width: 300}}
            value={language.value}
            onChange={(value: string) => language.setValue(value)}
          >
            {languageOptions}
          </Select>
        </Row>
        <Row style={{marginTop: 16, textAlign: 'right'}}>
          <Button
            type="primary"
            onClick={() => onTranslate(language.value)}
            disabled={language.value.length === 0}
          >
            Translate
          </Button>
        </Row>
      </Card>
    );
  });

const getItemStatus = (
  item: IContentItem,
  originalItem: IContentItem,
) => {
  if (item.value !== undefined && originalItem.value === undefined) {
    return 'success';
  }

  if (item.value && item.value !== originalItem.value) {
    return 'warning';
  }

  if (!item.value) {
    return 'error';
  }

  return '';
};
