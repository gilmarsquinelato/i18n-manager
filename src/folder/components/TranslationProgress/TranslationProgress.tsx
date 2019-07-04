import { Alert, Breadcrumb, Modal, Progress, Row } from 'antd';
import * as _ from 'lodash/fp';
import React, { useMemo } from 'react';

import commonStyles from '@src/Common.module.scss';
import { ITranslationError, ITranslationProgress } from '../../types';
import styles from './TranslationProgress.module.scss';


interface ITranslationProgressProps {
  isTranslating: boolean;
  translationProgress: ITranslationProgress;
  translationErrors: ITranslationError[];
  setIsTranslating: (isTranslating: boolean) => void;
  cancelTranslate: () => void;
}

const TranslationProgress: React.FC<ITranslationProgressProps> =
  ({isTranslating, translationProgress, translationErrors, setIsTranslating, cancelTranslate}) => {
    const percent = translationProgress && translationProgress.current > 0
      ? translationProgress.current / translationProgress.total * 100
      : 0;

    const estimatedTimeInSeconds = translationProgress.estimatedTimeInMs / 1000;
    const estimatedTimeInMinutes = estimatedTimeInSeconds / 60;

    return (
      <Modal
        title="Translating"
        visible={isTranslating}
        centered
        closable={false}
        cancelButtonProps={{disabled: percent === 100, type: 'danger', ghost: true}}
        okButtonProps={{disabled: percent < 100}}
        onOk={() => setIsTranslating(false)}
        onCancel={() => cancelTranslate()}
        width={768}
      >
        <Progress percent={percent} format={p => `${Math.round(p || 0)}%`}/>
        <PathBreadcrumb
          path={translationProgress.path}
          prefix={`Current (${translationProgress.language}):`}
        />
        {percent < 100 && (
          <Row>
            <span style={{marginRight: 8}}>Translations:</span>
            {translationProgress.current} of {translationProgress.total}
          </Row>
        )}

        {percent < 100 && (
          <Row>
            <span style={{marginRight: 8}}>Estimated time:</span>
            {estimatedTimeInSeconds > 60
              ? (<span>{estimatedTimeInMinutes.toFixed(0)} minutes</span>)
              : (<span>{estimatedTimeInSeconds.toFixed(0)} seconds</span>)}
          </Row>
        )}

        {translationErrors.length > 0 && (<TranslationErrors errors={translationErrors}/>)}
      </Modal>
    );
  };

export default TranslationProgress;


interface IPathBreadcrumbProps {
  path: string[];
  prefix?: React.ReactNode;
}

const PathBreadcrumb: React.FC<IPathBreadcrumbProps> = ({prefix, path}) => (
  <Row type="flex" align="middle">
    {prefix && (<span style={{marginRight: 8}}>{prefix}</span>)}

    <Breadcrumb>
      {path.map((it, index) => (
        <Breadcrumb.Item key={index}>{it}</Breadcrumb.Item>
      ))}
    </Breadcrumb>
  </Row>
);

interface ITranslationErrorDetailsProps {
  errors: ITranslationError[];
}

const TranslationErrors: React.FC<ITranslationErrorDetailsProps> = ({errors}) => {
  const groupedErrors = useMemo(() =>
      _.pipe(
        _.groupBy('path'),
        Object.entries,
        _.map(([, values]) => {
          return {
            path: values[0].path,
            errors: _.uniq(values.map((i: ITranslationError) => i.error)),
          };
        }),
      )(errors),
    [errors]);

  return (
    <div className={`${styles.ErrorList} ${commonStyles.Scroll}`}>
      {groupedErrors.map((it: any) => (
        <Alert
          key={it.path.join('.')}
          type="error"
          closable
          className={styles.Error}
          message={<PathBreadcrumb path={it.path} prefix="Error at:"/>}
          description={it.errors.map((error: string) => (<Row key={error}>{error}</Row>))}
        />
      ))}
    </div>
  );
};
