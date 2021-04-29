// @flow
import * as MODALS from 'constants/modal_types';
import * as ICONS from 'constants/icons';
import React from 'react';
import classnames from 'classnames';
import Button from 'component/button';

type Props = {
  uri: string,
  doOpenModal: (string, {}) => void,
  fileAction?: boolean,
  link?: boolean,
};

export default function CollectionAddButton(props: Props) {
  const { doOpenModal, uri, fileAction, link } = props;

  // one form for claim actions, one for thumb
  return (
    <Button
      button={link ? 'link' : 'secondary'}
      className={classnames({ 'button--file-action': fileAction })}
      icon={fileAction ? ICONS.ADD : ICONS.LIBRARY}
      iconSize={fileAction ? 22 : undefined}
      label={uri ? __('Add to Collection --[button to support a claim]--') : 'New Collection'}
      requiresAuth={IS_WEB}
      title={__('Add this claim to a list')}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        doOpenModal(MODALS.COLLECTION_ADD, { uri });
      }}
    />
  );
}
