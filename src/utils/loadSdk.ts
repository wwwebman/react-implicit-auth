interface LoadSdk {
  adapterId: string;
  async?: boolean;
  defer?: boolean;
  onerror?(e: ErrorEvent): void;
  onload?(e: Event): void;
  src: string;
}

const loadSdk = ({
  adapterId,
  async = true,
  defer = true,
  onerror = null,
  onload = null,
  src,
}: LoadSdk) => {
  const id = `${adapterId}-sdk`;
  const firstJs = document.getElementsByTagName('script')[0];
  const js = document.createElement('script');

  if (document.getElementById(id)) {
    return;
  }

  js.id = id;
  js.async = async;
  js.defer = defer;
  js.src = src;
  js.onload = onload;
  js.onerror = onerror;

  if (!firstJs) {
    document.appendChild(js);
  } else {
    firstJs.parentNode.appendChild(js);
  }
};

export default loadSdk;
