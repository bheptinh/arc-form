import * as WebIFC from "https://unpkg.com/web-ifc@0.0.51/web-ifc-api.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

export class IFCCreator extends EventDispatcher {
    constructor() {
        super();

        this.scene = null;
        this.ifcAPI = new WebIFC.IfcAPI();
        this.modelId = null;
        this.pointOrigin = null;

        this.coveringTypes = {
            cover: WebIFC.IFC4.IfcCoveringTypeEnum.FLOORING,
            ceiling: WebIFC.IFC4.IfcCoveringTypeEnum.CEILING,
            bottomPlinth: WebIFC.IFC4.IfcCoveringTypeEnum.SKIRTINGBOARD,
            topPlinth: WebIFC.IFC4.IfcCoveringTypeEnum.MOLDING,
        };
    }

    async init() {
        this.ifcAPI.SetWasmPath("/src_designer/js/IFCCreator/wasm/");

        this.dispatchEvent(new Event("ifcStatus", { status: 0 }));

        await this.ifcAPI.Init();

        this.dispatchEvent(new Event("ifcStatus", { status: 2 }));

        this.scene = this.getSceneStateForIFC();
        this.createIFCData();

        return;
    }

    generateGlobalId() {
        return this.ifcAPI.CreateIfcType(this.modelId, WebIFC.IFCGLOBALLYUNIQUEID, uuidv4());
    }

    getDirectionFromCoords(x, y, z) {
        // x,y,z - IFC
        return this.ifcAPI.CreateIfcEntity(this.modelId, WebIFC.IFCDIRECTION, [x, y, z]);
    }

    getCartesianPoint(x, y, z) {
        // x,y,z - THREE.js
        return this.ifcAPI.CreateIfcEntity(this.modelId, WebIFC.IFCCARTESIANPOINT, [
            this.ifcAPI.CreateIfcType(this.modelId, WebIFC.IFCLENGTHMEASURE, z),
            this.ifcAPI.CreateIfcType(this.modelId, WebIFC.IFCLENGTHMEASURE, x),
            this.ifcAPI.CreateIfcType(this.modelId, WebIFC.IFCLENGTHMEASURE, y),
        ]);
    }

    createPolyloop(cartPoints, i1, i2, i3) {
        const polyloop = this.ifcAPI.CreateIfcEntity(this.modelId, WebIFC.IFCPOLYLOOP, [
            cartPoints[i1],
            cartPoints[i2],
            cartPoints[i3],
        ]);
        return polyloop;
    }

    createIFCData() {
        const ifcAPI = this.ifcAPI;

        const newIfcModel = {
            authorization: "None",
            schema: WebIFC.Schemas.IFC4,
            name: "Testing IFC",
            authors: ["Leon"],
            organizations: ["BIMobject"], // Треба, щоб відкривалось в вювері https://docs.thatopen.com/Tutorials/FragmentIfcLoader
        };
        this.modelId = ifcAPI.CreateModel(newIfcModel);
        const modelId = this.modelId;

        // ↓↓↓
        const organization = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCORGANIZATION,
            null,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCLABEL, "ROOMTODO")
        );
        ifcAPI.WriteLine(modelId, organization);

        const person = ifcAPI.CreateIfcEntity(modelId, WebIFC.IFCPERSON, null, null);
        ifcAPI.WriteLine(modelId, person);

        const personAndOrganization = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCPERSONANDORGANIZATION,
            person,
            organization
        );
        ifcAPI.WriteLine(modelId, personAndOrganization);

        const application = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCAPPLICATION,
            organization,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCLABEL, "0.0.1"),
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCLABEL, "Application"),
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCIDENTIFIER, "Application Identifier")
        );
        ifcAPI.WriteLine(modelId, application);

        const ownerHistory = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCOWNERHISTORY,
            personAndOrganization,
            application,
            null,
            WebIFC.IFC4.IfcChangeActionEnum.ADDED,
            null,
            null,
            null,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCTIMESTAMP, Date.now())
        );
        ifcAPI.WriteLine(modelId, ownerHistory);
        // ↑↑↑

        // ↓↓↓ UNITS
        const unitLength = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCSIUNIT,
            WebIFC.IFC4.IfcUnitEnum.LENGTHUNIT,
            null,
            WebIFC.IFC4.IfcSIUnitName.METRE
        );
        ifcAPI.WriteLine(modelId, unitLength);

        const unitArea = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCSIUNIT,
            WebIFC.IFC4.IfcUnitEnum.AREAUNIT,
            null,
            WebIFC.IFC4.IfcSIUnitName.SQUARE_METRE
        );
        ifcAPI.WriteLine(modelId, unitArea);

        const unitAssign = ifcAPI.CreateIfcEntity(modelId, WebIFC.IFCUNITASSIGNMENT, [
            unitLength,
            unitArea,
        ]);
        ifcAPI.WriteLine(modelId, unitAssign);
        // ↑↑↑

        // ↓↓↓ COMMON
        this.pointOrigin = this.getCartesianPoint(0, 0, 0);
        ifcAPI.WriteLine(modelId, this.pointOrigin);

        const axis2Placement3DWorld = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCAXIS2PLACEMENT3D,
            this.pointOrigin,
            null,
            null
        ); //те саме що точка-позиція
        ifcAPI.WriteLine(modelId, axis2Placement3DWorld);

        const placementWorld = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCLOCALPLACEMENT,
            null,
            axis2Placement3DWorld
        );
        ifcAPI.WriteLine(modelId, placementWorld);
        // ↑↑↑

        // ↓↓↓
        const geomRepContext = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCGEOMETRICREPRESENTATIONCONTEXT,
            null,
            null,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCDIMENSIONCOUNT, 3),
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCREAL, 0.0001),
            axis2Placement3DWorld,
            null
        );
        ifcAPI.WriteLine(modelId, geomRepContext);

        const geomRepSubContext = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCGEOMETRICREPRESENTATIONSUBCONTEXT,
            null,
            null,
            geomRepContext,
            null,
            WebIFC.IFC4.IfcGeometricProjectionEnum.MODEL_VIEW,
            null
        );
        ifcAPI.WriteLine(modelId, geomRepSubContext);

        const project = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCPROJECT,
            this.generateGlobalId(),
            ownerHistory,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCLABEL, this.scene.projectName),
            null,
            null,
            null,
            null,
            [geomRepContext],
            unitAssign
        );
        ifcAPI.WriteLine(modelId, project);
        // ↑↑↑

        // ↓↓↓
        const site = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCSITE,
            this.generateGlobalId(),
            ownerHistory,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCLABEL, "Site"),
            null,
            null,
            placementWorld,
            null,
            null,
            WebIFC.IFC4.IfcElementCompositionEnum.ELEMENT
        );
        ifcAPI.WriteLine(modelId, site);
        // ↑↑↑

        // ↓↓↓
        const placementBuilding = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCLOCALPLACEMENT,
            placementWorld,
            axis2Placement3DWorld
        );
        ifcAPI.WriteLine(modelId, placementBuilding);

        const building = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCBUILDING,
            this.generateGlobalId(),
            ownerHistory,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCLABEL, "Building"),
            null,
            null,
            placementBuilding,
            null,
            null,
            WebIFC.IFC4.IfcElementCompositionEnum.ELEMENT
        );
        ifcAPI.WriteLine(modelId, building);
        // ↑↑↑

        // ↓↓↓
        const placementBuildingStorey = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCLOCALPLACEMENT,
            placementBuilding,
            axis2Placement3DWorld
        );
        ifcAPI.WriteLine(modelId, placementBuildingStorey);

        const buildingStorey = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCBUILDINGSTOREY,
            this.generateGlobalId(),
            ownerHistory,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCLABEL, "Building Storey"),
            null,
            null,
            placementBuildingStorey,
            null,
            null,
            WebIFC.IFC4.IfcElementCompositionEnum.ELEMENT,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCLENGTHMEASURE, 0)
        );
        ifcAPI.WriteLine(modelId, buildingStorey);
        // ↑↑↑

        // ↓↓↓
        const relAggregates = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCRELAGGREGATES,
            this.generateGlobalId(),
            ownerHistory,
            null,
            null,
            project,
            [site]
        );
        ifcAPI.WriteLine(modelId, relAggregates);

        const relAggregates2 = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCRELAGGREGATES,
            this.generateGlobalId(),
            ownerHistory,
            null,
            null,
            site,
            [building]
        );
        ifcAPI.WriteLine(modelId, relAggregates2);

        const relAggregates3 = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCRELAGGREGATES,
            this.generateGlobalId(),
            ownerHistory,
            null,
            null,
            building,
            [buildingStorey]
        );
        ifcAPI.WriteLine(modelId, relAggregates3);
        // ↑↑↑

        // ↓↓↓↓↓↓ CREATE ELEMENTS ↓↓↓↓↓↓
        // -----------------FURNISHING ELEMENTS-----------
        const furnishingElementArr = [];

        this.scene.products.forEach((productData) => {
            const furnishingElement = this.createFurnishingElement(
                geomRepSubContext,
                placementBuildingStorey,
                ownerHistory,
                productData
            );

            furnishingElementArr.push(furnishingElement);
        });

        const relContainedInSpatialStructureProduct = ifcAPI.CreateIfcEntity(
            //обгортка для всіх furnishingElement
            modelId,
            WebIFC.IFCRELCONTAINEDINSPATIALSTRUCTURE,
            this.generateGlobalId(),
            ownerHistory,
            null,
            null,
            furnishingElementArr,
            buildingStorey
        );
        ifcAPI.WriteLine(modelId, relContainedInSpatialStructureProduct);

        this.dispatchEvent(new Event("ifcStatus", { status: 8 }));

        // -----------------WALLS-----------
        const wallStandardCaseArr = [];

        this.scene.construction.walls.forEach((wallData) => {
            const wallStandardCase = this.createWallStandardCase(
                geomRepSubContext,
                placementBuildingStorey,
                ownerHistory,
                wallData
            );

            wallStandardCaseArr.push(wallStandardCase);
        });

        this.dispatchEvent(new Event("ifcStatus", { status: 10 }));

        // -----------------Frames-----------
        this.scene.construction.frames.forEach((frameData) => {
            const wallStandardCase = this.createWallStandardCase(
                geomRepSubContext,
                placementBuildingStorey,
                ownerHistory,
                frameData
            );

            wallStandardCaseArr.push(wallStandardCase);
        });

        this.dispatchEvent(new Event("ifcStatus", { status: 12 }));

        // -----------------Cap-----------
        if (this.scene.construction.cap.verts.length > 0) {
            const cap = this.createWallStandardCase(
                geomRepSubContext,
                placementBuildingStorey,
                ownerHistory,
                this.scene.construction.cap
            );
            wallStandardCaseArr.push(cap);
        }

        this.dispatchEvent(new Event("ifcStatus", { status: 14 }));

        // -----------------Cuts-----------
        this.scene.construction.cuts.forEach((cutData) => {
            const wallStandardCase = this.createWallStandardCase(
                geomRepSubContext,
                placementBuildingStorey,
                ownerHistory,
                cutData
            );

            wallStandardCaseArr.push(wallStandardCase);
        });

        this.dispatchEvent(new Event("ifcStatus", { status: 16 }));

        // -----------------Areas-----------
        this.scene.construction.areas.forEach((areaData) => {
            const wallStandardCase = this.createWallStandardCase(
                geomRepSubContext,
                placementBuildingStorey,
                ownerHistory,
                areaData
            );

            wallStandardCaseArr.push(wallStandardCase);
        });

        if (wallStandardCaseArr.length > 0) {
            const relContainedInSpatialStructureWalls = ifcAPI.CreateIfcEntity(
                //обгортка для всіх wallStandardCase
                modelId,
                WebIFC.IFCRELCONTAINEDINSPATIALSTRUCTURE,
                this.generateGlobalId(),
                ownerHistory,
                null,
                null,
                wallStandardCaseArr,
                buildingStorey
            );
            ifcAPI.WriteLine(modelId, relContainedInSpatialStructureWalls);
        }

        this.dispatchEvent(new Event("ifcStatus", { status: 18 }));

        // -----------------COVERING-----------
        const coveringElementArr = [];

        const coverings = this.scene.construction.covers
            .concat(this.scene.construction.ceilings)
            .concat(this.scene.construction.plinths);

        coverings.forEach((coverData) => {
            const covering = this.createCovering(
                geomRepSubContext,
                placementBuildingStorey,
                ownerHistory,
                coverData
            );

            coveringElementArr.push(covering);
        });

        if (coveringElementArr.length > 0) {
            const relContainedInSpatialStructureCover = ifcAPI.CreateIfcEntity(
                //обгортка для всіх coveringElement
                modelId,
                WebIFC.IFCRELCONTAINEDINSPATIALSTRUCTURE,
                this.generateGlobalId(),
                ownerHistory,
                null,
                null,
                coveringElementArr,
                buildingStorey
            );
            ifcAPI.WriteLine(modelId, relContainedInSpatialStructureCover);
        }

        this.dispatchEvent(new Event("ifcStatus", { status: 20 }));
    }

    createFurnishingElement(geomRepSubContext, placementBuildingStorey, ownerHistory, productData) {
        const ifcAPI = this.ifcAPI;
        const modelId = this.modelId;
        const facetedBrepsByHash = {};

        productData.meshesData.forEach((meshData) => {
            const polyloopArrMesh = this.createMeshVertsData(
                meshData,
                productData.sx,
                productData.sy,
                productData.sz
            );
            facetedBrepsByHash[meshData.hash] = this.createFacetedBrep(polyloopArrMesh);
        });

        const facetedBrepArr = Object.values(facetedBrepsByHash);

        const shapeRepresentationBrep = ifcAPI.CreateIfcEntity(
            modelId, //меші в одну модель
            WebIFC.IFCSHAPEREPRESENTATION,
            geomRepSubContext,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCLABEL, "Body"),
            null,
            facetedBrepArr
        );
        ifcAPI.WriteLine(modelId, shapeRepresentationBrep);

        const productDefShape = ifcAPI.CreateIfcEntity(
            //Обгортка для мешів однієї моделі
            modelId,
            WebIFC.IFCPRODUCTDEFINITIONSHAPE,
            null,
            null,
            [shapeRepresentationBrep] //меші
        );
        ifcAPI.WriteLine(modelId, productDefShape);

        const pos = this.getCartesianPoint(
            productData.x / 100,
            productData.y / 100,
            -productData.z / 100
        );
        ifcAPI.WriteLine(modelId, pos);

        const dirZ = this.getDirectionFromCoords(
            productData.dirYPos.z,
            productData.dirYPos.x,
            productData.dirYPos.y
        );
        ifcAPI.WriteLine(modelId, dirZ);

        const dirX = this.getDirectionFromCoords(
            productData.dirZPos.z,
            productData.dirZPos.x,
            productData.dirZPos.y
        );
        ifcAPI.WriteLine(modelId, dirX);

        const axis2Placement3DObject3D = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCAXIS2PLACEMENT3D,
            pos,
            dirZ,
            dirX
        );
        ifcAPI.WriteLine(modelId, axis2Placement3DObject3D);

        const localPlacementModel = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCLOCALPLACEMENT,
            placementBuildingStorey,
            axis2Placement3DObject3D
        );
        ifcAPI.WriteLine(modelId, localPlacementModel);

        const furnishingElement = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCFURNISHINGELEMENT,
            this.generateGlobalId(),
            ownerHistory,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCLABEL, productData.name),
            null,
            null,
            localPlacementModel,
            productDefShape,
            null
        );
        ifcAPI.WriteLine(modelId, furnishingElement);

        // Styling
        Object.entries(facetedBrepsByHash).forEach(([hash, facetedBrep]) => {
            const meshData = productData.meshesData.find((data) => data.hash === hash);
            const presentationStyledAssignment = this.createPresentationStyledAssignment(
                meshData.color
            );
            this.createStyledItem(facetedBrep, presentationStyledAssignment);
        });

        return furnishingElement;
    }

    createWallStandardCase(geomRepSubContext, placementBuildingStorey, ownerHistory, wallData) {
        const ifcAPI = this.ifcAPI;
        const modelId = this.modelId;

        const polyloopArrMesh = this.createWallVertsData(wallData.verts);
        const facetedBrep = this.createFacetedBrep(polyloopArrMesh);

        const shapeRepresentationBrep = ifcAPI.CreateIfcEntity(
            modelId, //меші в одну модель
            WebIFC.IFCSHAPEREPRESENTATION,
            geomRepSubContext,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCLABEL, "Body"),
            null,
            [facetedBrep]
        );
        ifcAPI.WriteLine(modelId, shapeRepresentationBrep);

        const productDefShape = ifcAPI.CreateIfcEntity(
            //Обгортка для мешів однієї моделі
            modelId,
            WebIFC.IFCPRODUCTDEFINITIONSHAPE,
            null,
            null,
            [shapeRepresentationBrep] //меші
        );
        ifcAPI.WriteLine(modelId, productDefShape);

        const axis2Placement3DObject3D = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCAXIS2PLACEMENT3D,
            this.pointOrigin
        );
        ifcAPI.WriteLine(modelId, axis2Placement3DObject3D);

        const localPlacementModel = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCLOCALPLACEMENT,
            placementBuildingStorey,
            axis2Placement3DObject3D
        );
        ifcAPI.WriteLine(modelId, localPlacementModel);

        const wallStandardCase = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCWALLSTANDARDCASE,
            this.generateGlobalId(),
            ownerHistory,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCLABEL, wallData.name),
            null,
            null,
            localPlacementModel,
            productDefShape,
            null
        );
        ifcAPI.WriteLine(modelId, wallStandardCase);

        // Styling
        const presentationStyledAssignment = this.createPresentationStyledAssignment(
            wallData.color
        );
        this.createStyledItem(facetedBrep, presentationStyledAssignment);

        return wallStandardCase;
    }

    createCovering(geomRepSubContext, placementBuildingStorey, ownerHistory, coverData) {
        const ifcAPI = this.ifcAPI;
        const modelId = this.modelId;

        const polyloopArrMesh = this.createWallVertsData(coverData.verts);
        const facetedBrep = this.createFacetedBrep(polyloopArrMesh);

        const shapeRepresentationBrep = ifcAPI.CreateIfcEntity(
            modelId, //меші в одну модель
            WebIFC.IFCSHAPEREPRESENTATION,
            geomRepSubContext,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCLABEL, "Body"),
            null,
            [facetedBrep]
        );
        ifcAPI.WriteLine(modelId, shapeRepresentationBrep);

        const productDefShape = ifcAPI.CreateIfcEntity(
            //Обгортка для мешів однієї моделі
            modelId,
            WebIFC.IFCPRODUCTDEFINITIONSHAPE,
            null,
            null,
            [shapeRepresentationBrep] //меші
        );
        ifcAPI.WriteLine(modelId, productDefShape);

        const axis2Placement3DObject3D = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCAXIS2PLACEMENT3D,
            this.pointOrigin
        );
        ifcAPI.WriteLine(modelId, axis2Placement3DObject3D);

        const localPlacement = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCLOCALPLACEMENT,
            placementBuildingStorey,
            axis2Placement3DObject3D
        );
        ifcAPI.WriteLine(modelId, localPlacement);

        const covering = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCCOVERING,
            this.generateGlobalId(),
            ownerHistory,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCLABEL, coverData.name),
            null,
            null,
            localPlacement,
            productDefShape,
            null,
            this.coveringTypes[coverData.type]
        );
        ifcAPI.WriteLine(modelId, covering);

        // Styling
        const presentationStyledAssignment = this.createPresentationStyledAssignment(
            coverData.color
        );
        this.createStyledItem(facetedBrep, presentationStyledAssignment);

        return covering;
    }

    createMeshVertsData(meshData, sx, sy, sz) {
        const scaleForIFC = meshData.scale.x < 2 ? 0.01 : 1;
        const scaleX = sx * scaleForIFC;
        const scaleY = sy * scaleForIFC;
        const scaleZ = sz * scaleForIFC;
        const verticesArr = [];
        const polyloopArr = [];

        for (let i = 0; i < meshData.verts.length; i += 3) {
            verticesArr.push(
                this.getCartesianPoint(
                    meshData.verts[i] * scaleX,
                    meshData.verts[i + 1] * scaleY,
                    meshData.verts[i + 2] * scaleZ
                )
            );
        }
        verticesArr.forEach((cartPoint) => {
            this.ifcAPI.WriteLine(this.modelId, cartPoint);
        });
        for (let i = 0; i < meshData.index.length; i += 3) {
            polyloopArr.push(
                this.createPolyloop(
                    verticesArr,
                    meshData.index[i],
                    meshData.index[i + 1],
                    meshData.index[i + 2]
                )
            );
        }
        polyloopArr.forEach((polyloop) => {
            this.ifcAPI.WriteLine(this.modelId, polyloop);
        });

        return polyloopArr;
    }

    createWallVertsData(vertices) {
        const indices = Array.from({ length: vertices.length / 3 }, (_, i) => i);
        const scaleForIFC = 0.01;
        const scaleX = scaleForIFC;
        const scaleY = scaleForIFC;
        const scaleZ = scaleForIFC;
        const verticesArr = [];
        const polyloopArr = [];

        for (let i = 0; i < vertices.length; i += 3) {
            verticesArr.push(
                this.getCartesianPoint(
                    vertices[i] * scaleX,
                    vertices[i + 1] * scaleY,
                    -vertices[i + 2] * scaleZ
                )
            );
        }
        verticesArr.forEach((cartPoint) => {
            this.ifcAPI.WriteLine(this.modelId, cartPoint);
        });
        for (let i = 0; i < indices.length; i += 3) {
            polyloopArr.push(
                this.createPolyloop(verticesArr, indices[i], indices[i + 1], indices[i + 2])
            );
        }
        polyloopArr.forEach((polyloop) => {
            this.ifcAPI.WriteLine(this.modelId, polyloop);
        });

        return polyloopArr;
    }

    createFacetedBrep(polyloopArr) {
        const ifcAPI = this.ifcAPI;
        const modelId = this.modelId;

        const faceBoundArr = polyloopArr.map((polyloop) =>
            ifcAPI.CreateIfcEntity(
                modelId,
                WebIFC.IFCFACEOUTERBOUND,
                polyloop,
                this.ifcAPI.CreateIfcType(modelId, WebIFC.IFCBOOLEAN, "T")
            )
        );
        faceBoundArr.forEach((faceBound) => {
            ifcAPI.WriteLine(modelId, faceBound);
        });

        const faceArr = faceBoundArr.map((faceBound) =>
            ifcAPI.CreateIfcEntity(modelId, WebIFC.IFCFACE, [faceBound])
        );
        faceArr.forEach((face) => {
            ifcAPI.WriteLine(modelId, face);
        });

        const closedShell = ifcAPI.CreateIfcEntity(modelId, WebIFC.IFCCLOSEDSHELL, faceArr);
        ifcAPI.WriteLine(modelId, closedShell);

        const facetedBrep = ifcAPI.CreateIfcEntity(modelId, WebIFC.IFCFACETEDBREP, closedShell);
        ifcAPI.WriteLine(modelId, facetedBrep); //like mesh

        return facetedBrep;
    }

    createPresentationStyledAssignment(params) {
        const ifcAPI = this.ifcAPI;
        const modelId = this.modelId;

        const colorSurface = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCCOLOURRGB,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCLABEL, "Some Surface Color"),
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCNORMALISEDRATIOMEASURE, params.r),
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCNORMALISEDRATIOMEASURE, params.g),
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCNORMALISEDRATIOMEASURE, params.b)
        );
        ifcAPI.WriteLine(modelId, colorSurface);

        const surfaceStyleRendering = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCSURFACESTYLERENDERING,
            colorSurface,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCNORMALISEDRATIOMEASURE, params.a || 0), //transparency
            null,
            null,
            null,
            null,
            null,
            null,
            WebIFC.IFC4.IfcReflectanceMethodEnum.NOTDEFINED
        );
        ifcAPI.WriteLine(modelId, surfaceStyleRendering);

        const surfaceStyle = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCSURFACESTYLE,
            ifcAPI.CreateIfcType(modelId, WebIFC.IFCLABEL, "Some Surface Style"),
            WebIFC.IFC4.IfcSurfaceSide.BOTH,
            [surfaceStyleRendering]
        );
        ifcAPI.WriteLine(modelId, surfaceStyle);

        const presentationStyledAssignment = ifcAPI.CreateIfcEntity(
            modelId,
            WebIFC.IFCPRESENTATIONSTYLEASSIGNMENT,
            [surfaceStyle]
        );
        ifcAPI.WriteLine(modelId, presentationStyledAssignment);

        return presentationStyledAssignment;
    }

    createStyledItem(facetedBrep, presentationStyledAssignment) {
        const styledItem = this.ifcAPI.CreateIfcEntity(
            this.modelId,
            WebIFC.IFCSTYLEDITEM,
            facetedBrep,
            [presentationStyledAssignment],
            null
        );
        this.ifcAPI.WriteLine(this.modelId, styledItem);

        return styledItem;
    }

    exportToFile() {
        const buffer = this.ifcAPI.SaveModel(this.modelId);
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${this.scene.projectName}.ifc`;
        link.click();
        link.remove();
    }

    getSceneStateForIFC() {
        const sceneState = {};
        const poolMaterials = {};

        sceneState.projectName = R2D.scene.getProjectName();

        const sceneObjects = R2D.scene.getSceneObjects();
        sceneState.products = sceneObjects.map((sceneObject) => makeSceneObjectData(sceneObject));

        this.dispatchEvent(new Event("ifcStatus", { status: 4 }));

        sceneState.construction = makeConstructionData();

        this.dispatchEvent(new Event("ifcStatus", { status: 6 }));

        return sceneState;

        // ----

        function makeSceneObjectData(sceneObject) {
            const viewer3d =
                R2D.commonSceneHelper.productHelper.findObjectView3dBySceneObject(sceneObject);

            const data = {
                id: sceneObject.getProductId(),
                objid: String(sceneObject.getObjectId()),
                type: sceneObject.getType(),
                x: sceneObject.x,
                y: sceneObject.y,
                z: -sceneObject.z,
                sx: sceneObject.scaleX,
                sy: sceneObject.scaleY,
                sz: sceneObject.scaleZ,

                dirYPos: viewer3d.object3d
                    .localToWorld(new THREE.Vector3(0, 1, 0))
                    .sub(viewer3d.object3d.localToWorld(new THREE.Vector3(0, 0, 0))),
                dirZPos: viewer3d.object3d
                    .localToWorld(new THREE.Vector3(0, 0, 1))
                    .sub(viewer3d.object3d.localToWorld(new THREE.Vector3(0, 0, 0))),

                width: sceneObject.width,
                height: sceneObject.height,
                depth: sceneObject.depth,
                name: sceneObject.getName(),

                meshesData: [],
            };

            if (sceneObject.forWall || sceneObject.isOwner) {
                const meshes = viewer3d.object3d.children;
                const materials = sceneObject.getMaterials && sceneObject.getMaterials();

                meshes.forEach((mesh, i) => {
                    let id = "";
                    let color = null;
                    if (sceneObject.type == "2") {
                        const material = materials.find((el) => el.hash === mesh.userData.md5);
                        id = material.addMaterial
                            ? material.addMaterial + material.current
                            : material.current;

                        if (id != 0 && !poolMaterials[id]) {
                            if (material.addMaterial) {
                                poolMaterials[id] = convertHexToRGB(id.substring(id.indexOf("#")));
                            } else {
                                poolMaterials[id] = mesh.material.map
                                    ? getColorFromImage(mesh.material.map.image)
                                    : getDefColor();
                            }
                        }

                        color = poolMaterials[id] || getDefColor();
                    } else if (sceneObject.type == "3" || sceneObject.type == "4") {
                        color = mesh.material.map
                            ? getColorFromImage(mesh.material.map.image)
                            : getDefColor();
                    }

                    const pos = mesh.geometry.attributes.position;

                    data.meshesData.push({
                        hash: mesh.userData.md5 || String(i),
                        verts: pos.array,
                        index:
                            mesh.geometry.index?.array ||
                            Array.from({ length: pos.count }, (_, i) => i),
                        scale: mesh.scale,
                        color: {
                            ...color,
                            a: mesh.material.transparent ? mesh.material.opacity : 0,
                        },
                    });
                });
            } else {
                data.sx = sceneObject.width / 100;
                data.sy = sceneObject.height / 100;
                data.sz = sceneObject.depth / 100;

                const mesh = R2D.Tool.initCubeForExport.children[0];
                const pos = mesh.geometry.attributes.position;
                data.meshesData.push({
                    hash: "1",
                    verts: pos.array,
                    index:
                        mesh.geometry.index?.array ||
                        Array.from({ length: pos.count }, (_, i) => i),
                    scale: mesh.scale,
                    color: getDefColor(),
                });
            }

            return data;
        }

        function makeConstructionData() {
            const construction = R2D.scene.constructor.getObjects();

            const walls = [];

            construction.walls.forEach((wall) => {
                if (wall.configData) {
                    const meshesOnWall = R2D.commonSceneHelper.constructorHelper
                        .findObjectView3DByConstructionData(wall)
                        .getMeshes();

                    wall.parts.forEach((part) => {
                        if (part.id !== -1) {
                            walls.push({
                                verts: part.vertices,
                                name: `wall ${wall.id} part ${part.id}`,
                                color: getColor(part, "wall", meshesOnWall),
                            });
                        }
                    });
                } else {
                    walls.push({
                        verts: wall.vertices,
                        name: `wall ${wall.id}`,
                        color: getColor(wall, "wall"),
                    });
                }
            });

            const frames = construction.frames.map((frame, i) => ({
                verts: frame.vertices,
                name: `frame ${i}`,
                color: getColor(frame, "wall"),
            }));

            const cap = {
                verts: construction.cap.vertices,
                name: "cap",
                color: getColor(construction.cap, "cap"),
            };

            const cuts = construction.cuts.map((cut) => ({
                verts: cut.vertices,
                name: `cut ${cut.id}`,
                color: getColor(cut, "wall"),
            }));

            const areas = construction.areas.map((area) => ({
                verts: area.vertices,
                name: `area ${area.id}`,
                color: getColor(area, "wall"),
            }));

            const covers = construction.covers.map((cover) => ({
                type: "cover",
                verts: cover.vertices,
                name: `cover ${cover.id}`,
                color: getColor(cover, "cover"),
            }));

            const ceilings = construction.ceilings.map((ceiling) => ({
                type: "ceiling",
                verts: ceiling.vertices,
                name: `ceiling ${ceiling.id}`,
                color: getColor(ceiling, "ceiling"),
            }));

            const plinths = construction.plinths
                .filter((pl) => pl.exists)
                .map((plinth, i) => ({
                    type: plinth.type,
                    verts: plinth.vertices,
                    name: `${plinth.type} ${i}`,
                    color: getColor(plinth, "plinth"),
                }));

            return {
                walls,
                frames,
                cap,
                areas,
                cuts,
                covers,
                ceilings,
                plinths,
            };
        }

        function getColor(element, type, meshesOnWall = false) {
            let mesh = null;
            const id = element.addMaterialID
                ? element.addMaterialID + element.materialID
                : element.materialID || R2D.default.getDefaultMaterialByKey(type);

            if (!poolMaterials[id]) {
                if (element.addMaterialID) {
                    poolMaterials[id] = convertHexToRGB(id.substring(id.indexOf("#")));
                } else {
                    if (meshesOnWall) {
                        mesh = meshesOnWall.find((el) => el.num === element.id);
                    } else {
                        mesh = R2D.commonSceneHelper.constructorHelper
                            .findObjectView3DByConstructionData(element)
                            .getObject3d();
                    }
                    poolMaterials[id] = mesh?.material.map
                        ? getColorFromImage(mesh.material.map.image)
                        : getDefColor();
                }
            }

            return poolMaterials[id];
        }

        function getColorFromImage(image) {
            if (!image) return getDefColor();

            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, image.width, image.height);
            const data = ctx.getImageData(0, 0, image.width, image.height).data;
            let r = 0,
                g = 0,
                b = 0;
            for (let i = 0; i < data.length; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
            }
            const n = (data.length / 4) * 255;

            return { r: r / n, g: g / n, b: b / n };
        }

        function convertHexToRGB(hex) {
            const r = parseInt(hex.substring(1, 3), 16) / 255;
            const g = parseInt(hex.substring(3, 5), 16) / 255;
            const b = parseInt(hex.substring(5), 16) / 255;
            return { r, g, b };
        }

        function isOwner(sceneObject) {
            // use sceneObject.isOwner() instead
            const curUserKey = R2D.UserCore._instance.getKey();
            const ownerUserKey = sceneObject.objectData.user_key;
            return curUserKey === ownerUserKey;
        }

        function getDefColor() {
            return {
                r: 128 / 256,
                g: 128 / 256,
                b: 128 / 256,
            };
        }
    }
}
