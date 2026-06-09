import React, { useEffect, useRef } from 'react';
import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
  canvasWrap: {
    width: '100%',
    height: '100%',
  },
});

const ThreeCanvas = (props) => {
  const classes = useStyle();
  const canvasWrapRef = useRef(null);

  const camera = new THREE.PerspectiveCamera();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  const lights = new R2D.Light3D(true);
  scene.add(lights.getMiddle());
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableKeys = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.5;

  const animate = () => {
    renderer.render(scene, camera);
    controls.update();
  };
  renderer.setAnimationLoop(animate);

  const updateCamera = (width, height, depth) => {
    const vFovRad = (Math.PI / 180) * camera.fov;
    const aspect = camera.aspect;
    const pan = 0.5;
    const tilt = 0.7;
    const distance = findCameraDist(aspect, vFovRad, width, height, depth);
    camera.position.set(
      distance * Math.cos(tilt) * Math.sin(pan),
      distance * Math.sin(tilt),
      distance * Math.cos(tilt) * Math.cos(pan)
    );
    camera.lookAt(0, height / 2, 0);
    camera.updateProjectionMatrix();

    controls.minDistance = distance * 0.4;
    controls.maxDistance = distance * 1.5;
    controls.target.set(0, height / 2, 0);

    function findCameraDist(cameraAspect, vFov, objWidth, objHeight, objDepth) {
      function distToFitSizeInView(size, fov) {
        return size / (2 * Math.tan(fov / 2));
      }

      const k = 0.8;
      const objAspect = objWidth / objHeight;
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * cameraAspect);

      const diametr = Math.sqrt(objWidth ** 2 + objHeight ** 2 + objDepth ** 2);

      const dist =
        objAspect < cameraAspect
          ? distToFitSizeInView(diametr, vFov)
          : distToFitSizeInView(diametr, hFov);

      return dist + objDepth * cameraAspect * k;
    }
  };

  function loaderCompleteListener(e) {
    const productData = R2D.Pool.getProductData(props.modelId);
    const sceneObject = R2D.Creator.makeSceneObject(productData);
    sceneObject.x = 0;
    sceneObject.y = 0;
    sceneObject.z = 0;
    const objectView3D = R2D.ObjectViewer3D.make(sceneObject);

    objectView3D.addEventListener(Event.UPDATE, () => {
      renderer.render(scene, camera);
    });

    sceneObject.update();
    scene.add(objectView3D.object3d);
    updateCamera(sceneObject.defaultWidth, sceneObject.defaultHeight, sceneObject.defaultDepth);
  }

  useEffect(() => {
    let dataLoader = R2D.Pool.isLoaderProductData(props.modelId);
    if (!dataLoader) dataLoader = R2D.Pool.loadProductData(props.modelId);
    dataLoader.addEventListener(Event.COMPLETE, loaderCompleteListener);

    if (canvasWrapRef?.current) {
      if (canvasWrapRef.current.hasChildNodes()) {
        canvasWrapRef.current.removeChild(canvasWrapRef.current.firstChild);
      }
      canvasWrapRef.current.appendChild(renderer.domElement);

      renderer.setSize(canvasWrapRef.current.clientWidth, canvasWrapRef.current.clientHeight);
      camera.aspect = canvasWrapRef.current.clientWidth / canvasWrapRef.current.clientHeight;
      camera.updateProjectionMatrix();
    }

    return () => {
      renderer.setAnimationLoop(null);
      renderer.dispose();
      renderer.forceContextLoss();
      controls.dispose();
    };
  }, []);

  return <div className={classes.canvasWrap} ref={canvasWrapRef} />;
};

export default ThreeCanvas;
