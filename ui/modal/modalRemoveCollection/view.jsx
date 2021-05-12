// @flow
import React from 'react';
import { Modal } from 'modal/modal';
import Button from 'component/button';
import Card from 'component/common/card';
import I18nMessage from 'component/i18nMessage';

type Props = {
  closeModal: () => void,
  collectionDelete: (string) => void,
  title: string,
  collectionId: string,
};

function ModalRemoveCollection(props: Props) {
  const { closeModal, title, collectionDelete, collectionId } = props;

  return (
    <Modal isOpen contentLabel={__('Confirm Collection Unpublish')} type="card" onAborted={closeModal}>
      <Card
        title={__('Delete Collection')}
        subtitle={
          <I18nMessage tokens={{ title: <cite>{`"${title}"`}</cite> }}>
            Are you sure you'd like to remove collection %title%?
          </I18nMessage>
        }
        actions={
          <>
            <div className="section__actions">
              <Button button="primary" label={__('Delete')} onClick={() => collectionDelete(collectionId)} />
              <Button button="link" label={__('Cancel')} onClick={closeModal} />
            </div>
          </>
        }
      />
    </Modal>
  );
}

export default ModalRemoveCollection;
