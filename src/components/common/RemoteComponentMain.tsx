import React, { useEffect, useState } from 'react';
import { RemoteComponent } from "@paciolan/remote-component";

import { planner } from '../../initR2D';

const RemoteComponentMain = props => {
    let [blobUrl, setBlobUrl] = useState('');
   
    useEffect(async () => {
        let applications;
        try {
            let blobUrl;
            applications = planner.getSavedApplications() || {};
            if(applications && applications[props.data.applicationType]) {
                const blob = new Blob([applications[props.data.applicationType]], { type: "text/javascript" });
                blobUrl = URL.createObjectURL(blob);
                
            } else {
                const jszip = new JSZip();
                let zipLoad = await fetch(R2D.URL.DOMAIN + props.zipUrl);
                const zipArrayBuffer = await zipLoad.arrayBuffer();
                const zipContent = await jszip.loadAsync(zipArrayBuffer);
                const jsFile = Object.keys(zipContent.files).find(file => file.endsWith('react/app.js'));
        
                const code = await zipContent.files[jsFile].async('text');
                const dataForStorage = await zipContent.files[jsFile].async('string');
        
                const blob = new Blob([code], { type: "text/javascript" });
                blobUrl = URL.createObjectURL(blob);

                let newApplicationToSaveStorage = {...applications};
                newApplicationToSaveStorage[props.data.applicationType] = dataForStorage;
                planner.updateSavedApplications(newApplicationToSaveStorage);
            }

            setBlobUrl(() => blobUrl);
            
        } catch(e) {
            console.error("Error loading ZIP file:", e);
        }
    }, [props.zipUrl]);

    useEffect(() => {
        return() => URL.revokeObjectURL(blobUrl);
    }, [])

    return (
        blobUrl && <RemoteComponent data={props.data} url={blobUrl} zipUrl={props.zipUrl}/> 
    );
};

export default RemoteComponentMain;