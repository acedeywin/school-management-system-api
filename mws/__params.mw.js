/* eslint-disable no-unused-vars */
module.exports = ({ meta, config, managers }) => {
  return ({ req, res, next }) => {
    next(req.params)
  }
}
