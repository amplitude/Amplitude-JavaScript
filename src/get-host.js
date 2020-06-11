const getHost = (url) => {
  const a = document.createElement('a');
  a.href = url;
  return a.hostname || location.hostname; 
};

export default getHost;
