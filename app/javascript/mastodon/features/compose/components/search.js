import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import Overlay from 'react-overlays/lib/Overlay';
import Motion from '../../ui/util/optional_motion';
import spring from 'react-motion/lib/spring';
import { searchEnabled } from '../../../initial_state';
import Icon from 'mastodon/components/icon';

const messages = defineMessages({
  placeholder: { id: 'search.placeholder', defaultMessage: 'Clear search' },
  placeholderSignedIn: { id: 'search.search_or_paste', defaultMessage: 'Search or paste URL' },
});

class SearchPopout extends React.PureComponent {

  static propTypes = {
    style: PropTypes.object,
  };

  render () {
    const { style } = this.props;
    const extraInformation = searchEnabled ? <FormattedMessage id='search_popout.tips.full_text' defaultMessage='Simple text returns statuses you have written, favourited, boosted, or have been mentioned in, as well as matching usernames, display names, and hashtags.' /> : <FormattedMessage id='search_popout.tips.text' defaultMessage='Simple text returns matching display names, usernames and hashtags' />;
    return (
      <div style={{ ...style, position: 'absolute', width: 285, zIndex: 2 }}>
        <Motion defaultStyle={{ opacity: 0, scaleX: 0.85, scaleY: 0.75 }} style={{ opacity: spring(1, { damping: 35, stiffness: 400 }), scaleX: spring(1, { damping: 35, stiffness: 400 }), scaleY: spring(1, { damping: 35, stiffness: 400 }) }}>
          {({ opacity, scaleX, scaleY }) => (
            <div className='search-popout' style={{ opacity: opacity, transform: `scale(${scaleX}, ${scaleY})` }}>
              <h4><FormattedMessage id='search_popout.search_format' defaultMessage='Advanced search format' /></h4>

              <ul>
                <li><em>#example</em> <FormattedMessage id='search_popout.tips.hashtag' defaultMessage='hashtag' /></li>
                <li><em>@username@domain</em> <FormattedMessage id='search_popout.tips.user' defaultMessage='user' /></li>
                <li><em>URL</em> <FormattedMessage id='search_popout.tips.user' defaultMessage='user' /></li>
                <li><em>URL</em> <FormattedMessage id='search_popout.tips.status' defaultMessage='status' /></li>
              </ul>

              {extraInformation}
            </div>
          )}
        </Motion>
      </div>
    );
  }

}

export default @injectIntl
class Search extends React.PureComponent {

  static contextTypes = {
    router: PropTypes.object.isRequired,
    identity: PropTypes.object.isRequired,
  };

  static propTypes = {
    value: PropTypes.string.isRequired,
    submitted: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    onShow: PropTypes.func.isRequired,
    openInRoute: PropTypes.bool,
    intl: PropTypes.object.isRequired,
    singleColumn: PropTypes.bool,
  };

  state = {
    expanded: false,
  };

  setRef = c => {
    this.searchForm = c;
  }

  handleChange = (e) => {
    this.props.onChange(e.target.value);
  }

  handleClear = (e) => {
    e.preventDefault();

    if (this.props.value.length > 0 || this.props.submitted) {
      this.props.onClear();
    }
  }

  handleClearKeyboard = (e) => {

    if (e.key === 'Enter' || e.key === ' ' && (this.props.value.length > 0 || this.props.submitted)) {
      e.preventDefault();
      this.props.onClear();
    }
  }

  handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      this.props.onSubmit();

      if (this.props.openInRoute) {
        this.context.router.history.push('/search');
      }
    } else if (e.key === 'Escape') {
      document.querySelector('.ui').parentElement.focus();
    }
  }

  handleFocus = () => {
    this.setState({ expanded: true });
    this.props.onShow();

    if (this.searchForm && !this.props.singleColumn) {
      const { left, right } = this.searchForm.getBoundingClientRect();
      if (left < 0 || right > (window.innerWidth || document.documentElement.clientWidth)) {
        this.searchForm.scrollIntoView();
      }
    }
  }

  handleBlur = () => {
    this.setState({ expanded: false });
  }

  render () {
    const { intl, value, submitted } = this.props;
    const { expanded } = this.state;
    const { signedIn } = this.context.identity;
    const hasValue = value.length > 0 || submitted;

    return (
      <div className='search'>
        <input
          ref={this.setRef}
          className='search__input'
          type='text'
          placeholder={intl.formatMessage(signedIn ? messages.placeholderSignedIn : messages.placeholder)}
          aria-label={intl.formatMessage(signedIn ? messages.placeholderSignedIn : messages.placeholder)}
          value={value}
          onChange={this.handleChange}
          onKeyUp={this.handleKeyUp}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
        />

        <div className='search__icon' >
          {!hasValue && <Icon id='search' className='active' />}
          {hasValue && <Icon role='button' tabIndex={0} id='times-circle' className='active' aria-label={intl.formatMessage(messages.placeholder)} onClick={this.handleClear} onKeyDown={this.handleClearKeyboard} />}
        </div>
        <Overlay aria-hidden show={expanded && !hasValue} placement='bottom' target={this} container={this}>
          <SearchPopout />
        </Overlay>
      </div>
    );
  }

}
