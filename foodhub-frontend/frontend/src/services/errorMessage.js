function getErrorMessage(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.response) {
    return "Something went wrong. Please try again.";
  }
  if (error.code === "ECONNABORTED") {
    return "The server took too long to respond. Please try again.";
  }
  return "Cannot reach the server. Please check that the gateway is running.";
}

export default getErrorMessage;
