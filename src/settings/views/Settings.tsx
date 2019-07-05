import { RouteComponentProps } from '@reach/router';
import { Button, Card, Form, Input, Layout, PageHeader } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import React, { useCallback } from 'react';

import RemoteLink from '@src/components/RemoteLink';
import { useAction, useStoreState } from '@src/store';
import { ICustomSettings } from '@typings/index';
import { actions } from '../store';
import styles from './Settings.module.scss';


const GOOGLE_API_WIZARD_URL =
  'https://console.cloud.google.com/apis/credentials/wizard?api=translate.googleapis.com';

const Settings: React.FC<RouteComponentProps> = () => {
  const settings = useStoreState(state => state.settings.settings);
  const saveSettings = useAction(actions.saveSettings);

  const handleSubmit = useCallback(
    (e: React.FormEvent, form: WrappedFormUtils<ICustomSettings>) => {
      e.preventDefault();

      form.validateFields((err, values) => {
        saveSettings(values);
      });
    },
    [saveSettings]);

  return (
    <Layout>
      <Layout.Content>
        <Card
          className={styles.Card}
          title={<PageHeader title="Settings" onBack={() => window.history.back()}/>}
        >
          <WrappedSettingsForm settings={settings} onSubmit={handleSubmit}/>
        </Card>
      </Layout.Content>
    </Layout>
  );
};

export default Settings;

interface ISettingsFormProps extends FormComponentProps {
  settings: ICustomSettings;
  onSubmit: (e: React.FormEvent, form: WrappedFormUtils<ICustomSettings>) => void;
}

const SettingsForm: React.FC<ISettingsFormProps> = ({form, settings, onSubmit}) => {
  const {getFieldDecorator} = form;

  return (
    <Form onSubmit={e => onSubmit(e, form)}>
      <Form.Item
        label="Google Translate™ API Key"
        help={<RemoteLink href={GOOGLE_API_WIZARD_URL}/>}
      >
        {getFieldDecorator(
          'googleTranslateApiKey',
          {initialValue: settings.googleTranslateApiKey},
        )(<Input/>)}
      </Form.Item>

      <Form.Item className={styles.FormActions}>
        <Button type="danger" ghost htmlType="reset" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

const WrappedSettingsForm = Form.create<ISettingsFormProps>({name: 'settings'})(SettingsForm);
