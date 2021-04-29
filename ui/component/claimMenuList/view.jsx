// @flow
import { URL, SHARE_DOMAIN_URL } from 'config';
import * as ICONS from 'constants/icons';
import * as PAGES from 'constants/pages';
import React from 'react';
import classnames from 'classnames';
import { Menu, MenuButton, MenuList, MenuItem } from '@reach/menu-button';
import Icon from 'component/common/icon';
import { generateShareUrl } from 'util/url';
import { useHistory } from 'react-router';

const SHARE_DOMAIN = SHARE_DOMAIN_URL || URL;

type Props = {
  uri: string,
  claim: ?Claim,
  inline?: boolean,
  claimIsMine: boolean,
  channelIsMuted: boolean,
  channelIsBlocked: boolean,
  doToggleMuteChannel: (string) => void,
  doCommentModBlock: (string) => void,
  doCommentModUnBlock: (string) => void,
};

function ClaimMenuList(props: Props) {
  const {
    uri,
    claim,
    inline = false,
    claimIsMine,
    doToggleMuteChannel,
    channelIsMuted,
    channelIsBlocked,
    doCommentModBlock,
    doCommentModUnBlock,
  } = props;

  const { push } = useHistory();

  const channelUri =
    claim &&
    (claim.value_type === 'channel'
      ? claim.permanent_url
      : claim.signing_channel && claim.signing_channel.permanent_url);

  const shareUrl: string = generateShareUrl(SHARE_DOMAIN, uri);

  if (!channelUri || !claim) {
    return null;
  }

  const isStream = claim.value_type === 'stream';

  function handleToggleMute() {
    doToggleMuteChannel(channelUri);
  }

  function handleToggleBlock() {
    if (channelIsBlocked) {
      doCommentModUnBlock(channelUri);
    } else {
      doCommentModBlock(channelUri);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl);
  }

  function handleReportContent() {
    push(`/$/${PAGES.REPORT_CONTENT}?claimId=${claim.claim_id}`);
  }

  return (
    <Menu>
      <MenuButton
        className={classnames('menu__button', { 'claim__menu-button': !inline, 'claim__menu-button--inline': inline })}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <Icon size={20} icon={ICONS.MORE_VERTICAL} />
      </MenuButton>
      <MenuList className="menu__list">
        {/* if stream, add to watch later, add to collection modal */}
        {isStream && (
          <>
            <MenuItem className="comment__menu-option" onSelect={() => alert('watch later')}>
              <div className="menu__link">
                <Icon aria-hidden icon={ICONS.DISCOVER} />
                {__('Watch Later')}
              </div>
            </MenuItem>
          </>
        )}
        <MenuItem className="comment__menu-option" onSelect={() => alert('Add')}>
          <div className="menu__link">
            <Icon aria-hidden icon={ICONS.ADD} />
            {__('Add to collection')}
          </div>
        </MenuItem>
        <hr className="menu__separator" />
        {!claimIsMine && (
          <>
            <MenuItem className="comment__menu-option" onSelect={handleToggleBlock}>
              <div className="menu__link">
                <Icon aria-hidden icon={ICONS.BLOCK} />
                {channelIsBlocked ? __('Unblock Channel') : __('Block Channel')}
              </div>
            </MenuItem>

            <MenuItem className="comment__menu-option" onSelect={handleToggleMute}>
              <div className="menu__link">
                <Icon aria-hidden icon={ICONS.MUTE} />
                {channelIsMuted ? __('Unmute Channel') : __('Mute Channel')}
              </div>
            </MenuItem>

            <hr className="menu__separator" />
          </>
        )}

        <MenuItem className="comment__menu-option" onSelect={handleCopyLink}>
          <div className="menu__link">
            <Icon aria-hidden icon={ICONS.SHARE} />
            {__('Copy Link')}
          </div>
        </MenuItem>

        {!claimIsMine && (
          <MenuItem className="comment__menu-option" onSelect={handleReportContent}>
            <div className="menu__link">
              <Icon aria-hidden icon={ICONS.REPORT} />
              {__('Report Content')}
            </div>
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  );
}

export default ClaimMenuList;
