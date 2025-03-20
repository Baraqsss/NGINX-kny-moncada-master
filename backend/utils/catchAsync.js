/**
 * Helper function to catch errors in async controller functions
 * @param {Function} fn - The async controller function
 * @returns {Function} Express middleware function that handles errors
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}; 