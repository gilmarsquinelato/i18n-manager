import { Button, Card, Checkbox, Form, Radio, Row, Select } from 'antd';
import React, { useCallback, useMemo } from 'react';
import { useArray, useBoolean, useInput } from 'react-hanger';
import { RouteComponentProps, withRouter } from 'react-router';

import { containsLanguage } from '../../functions';
import { ILanguageListItem, ITranslatePayload } from '../../types';
import styles from './TranslationPanel.module.scss';


interface ITranslationPanelProps {
  languageList: ILanguageListItem[];
  allLanguages: string[];
  supportedLanguages: string[];
  onTranslate: (payload: ITranslatePayload) => void;
  isGoogleTranslateSetUp: boolean;
  selectedId: string;
}

const TranslationPanel = React.memo<ITranslationPanelProps & RouteComponentProps<any>>(
  ({
     languageList,
     allLanguages,
     supportedLanguages,
     onTranslate,
     isGoogleTranslateSetUp,
     selectedId,
     history,
   }) => {
    const mode = useInput('');
    const overwrite = useBoolean(false);
    const targets = useArray<string>([]);
    const source = useInput();
    const collapsed = useBoolean(false);

    const allSupportedLanguages = useMemo(
      () => allLanguages.filter(it => containsLanguage(supportedLanguages, it)),
      [allLanguages, containsLanguage, supportedLanguages],
    );

    const handleTargetChange = useCallback((values: string[]) => {
      if (values.indexOf('all') !== -1) {
        targets.setValue(allSupportedLanguages);
      } else {
        targets.setValue(values);
      }
    }, [targets, allLanguages]);

    const handleTranslateClick = useCallback(() => {
      onTranslate({
        targetLanguages: targets.value,
        sourceLanguage: source.value,
        mode: mode.value,
        overwrite: overwrite.value,
      });
    }, [targets, source, mode, overwrite, onTranslate]);

    const languageOptions = languageList.map(it => {
      const disabled = !containsLanguage(supportedLanguages, it.language);

      return (
        <Select.Option
          value={it.language}
          key={it.language + it.label}
          disabled={disabled}
          title={disabled ? 'This language is not supported by Google Translate' : ''}
        >
          {it.label}
        </Select.Option>
      );
    });


    return (
      <Card className={`${styles.Container} ${collapsed.value ? styles.Collapsed : ''}`}>
        <div className={styles.Content}>
          <Row>
            <Form.Item colon={false} label="Translate" labelCol={{span: 3}} wrapperCol={{span: 21}}>
              <Select
                value={targets.value}
                onChange={handleTargetChange}
                placeholder="Target Languages"
                mode="tags"
                allowClear
                maxTagCount={4}
                maxTagTextLength={14}
                style={{width: '100%'}}
              >
                <Select.Option value="all">Select all</Select.Option>
                {languageOptions}
              </Select>
            </Form.Item>
          </Row>

          <Row>
            <Form.Item colon={false} label="From" labelCol={{span: 3}} wrapperCol={{span: 10}}>
              <Select
                value={source.value}
                onChange={(value: string) => source.setValue(value)}
                placeholder="Source Language"
                showSearch
                style={{width: '100%'}}
              >
                {languageOptions}
              </Select>
            </Form.Item>
          </Row>

          <Row>
            <Radio.Group value={mode.value} onChange={e => mode.setValue(e.target.value)}>
              <Radio value="this" disabled={selectedId.length === 0}>This Key</Radio>
              <Radio value="all">All Keys</Radio>
            </Radio.Group>

            <Checkbox value={overwrite.value} onChange={overwrite.toggle}>
              Overwrite not empty fields
            </Checkbox>

            {isGoogleTranslateSetUp && (
              <Button
                type="primary"
                onClick={handleTranslateClick}
                disabled={!source.value || targets.value.length === 0 || mode.value.length === 0}
              >
                Translate
              </Button>
            )}

            {!isGoogleTranslateSetUp && (
              <Button
                type="danger"
                ghost
                onClick={() => history.push('/settings')}
              >
                Configure Google Translate™
              </Button>
            )}
          </Row>
        </div>

        <div className={`${styles.TranslateMessage}`}>Translate</div>
        <Button icon="up" type="link" className={styles.CollapseButton} onClick={collapsed.toggle}/>
      </Card>
    );
  },
);

export default withRouter(TranslationPanel);
