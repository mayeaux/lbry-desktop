import { connect } from 'react-redux';
import { doOpenModal } from 'redux/actions/app';
import PlaylistAddButton from './view';

const select = (state, props) => ({});

export default connect(select, {
  doOpenModal,
})(PlaylistAddButton);
