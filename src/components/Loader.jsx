import './loader.css'
import PropTypes from 'prop-types'

// TODO use styled-components

const Loader = ({ abrupt, hidden, ...props }) => {
  return (
    <span
      {...props}
      className={`loader-container ${abrupt ? 'abrupt' : ''} ${
        hidden ? 'hidden' : ''
      }`}
    >
      <span className="loader" />
    </span>
  )
}

Loader.propTypes = {
  abrupt: PropTypes.bool,
  hidden: PropTypes.bool,
}
export default Loader
