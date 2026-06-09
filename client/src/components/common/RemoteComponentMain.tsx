import React, { useEffect, useState } from 'react';

// import { RemoteComponent } from "@paciolan/remote-component";
import { planner } from '../../initR2D';

const RemoteComponentMain = (props) => {
  const [blobUrl, setBlobUrl] = useState('');

  useEffect(() => {
    async function load() {
      try {
        let blobUrl;
        const applications = planner.getSavedApplications() || {};
        if (applications[props.data.applicationType]) {
          const blob = new Blob([applications[props.data.applicationType]], {
            type: 'text/javascript',
          });
          blobUrl = URL.createObjectURL(blob);
        } else {
          const jszip = new JSZip();
          const zipLoad = await fetch(R2D.URL.DOMAIN + props.zipUrl);
          const zipArrayBuffer = await zipLoad.arrayBuffer();
          const zipContent = await jszip.loadAsync(zipArrayBuffer);
          const jsFile = Object.keys(zipContent.files).find((file) => file.endsWith('react/app'));

          const code = await zipContent.files[jsFile].async('text');
          const dataForStorage = await zipContent.files[jsFile].async('string');

          const blob = new Blob([code], { type: 'text/javascript' });
          blobUrl = URL.createObjectURL(blob);

          planner.updateSavedApplications({
            ...applications,
            [props.data.applicationType]: dataForStorage,
          });
        }
        setBlobUrl(blobUrl);
      } catch (e) {
        console.error('Error loading ZIP file:', e);
      }
    }
    load();
  }, [props.zipUrl]);

  useEffect(() => {
    return () => URL.revokeObjectURL(blobUrl);
  }, []);

  console.log('‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️');
  console.log('‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️');
  console.log(props.zipUrl);
  console.log('‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️');
  console.log('‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️‼️');

  return null;

  // return (
  //     blobUrl && <RemoteComponent data={props.data} url={blobUrl} zipUrl={props.zipUrl}/>
  // );
};

export default RemoteComponentMain;
