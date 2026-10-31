### GET https://roomtodo.com/api2/render-camera-views?plan_id=786589

Response Payload:

```
{
    "status": "ok",
    "data": [
        {
            "id": 5544,
            "config": {
                "fov": 40,
                "pan": 0,
                "pano": {
                    "id": "#ffffff",
                    "rotation": 0,
                    "previewImgSrc": ""
                },
                "tilt": 1.57,
                "type": "perspective",
                "anchor": {
                    "x": 0,
                    "y": 0.0009385534763168836,
                    "z": -2.3572066964414593
                },
                "distance": 2960.1,
                "position": {
                    "x": 0,
                    "y": 2960.1,
                    "z": 7.34788079488412e-14
                },
                "rotation": {
                    "x": -1.57,
                    "y": 0,
                    "z": 0
                },
                "renderMakeType": "topView",
                "renderMakeScreen": "landscape"
            },
            "previewUrl": "/files/plans/7865/786589/eb7a2fbc1f3eb950f0277697c5a79f11.jpg"
        }
    ]
}
```

### POST https://roomtodo.com/api2/render-camera-views

Request Payload:

```
{"preview":"data:image/jpeg;base64,......","config":{"type":"perspective","fov":40,"pan":0,"tilt":1.57,"distance":4990.001588517358,"position":{"x":0,"y":5000,"z":0.0091185089394763},"anchor":{"x":0,"y":10,"z":-3.9725150447268405},"rotation":{"x":-1.57,"y":0,"z":0},"pano":{"id":"#ffffff","previewImgSrc":"","rotation":0},"renderMakeType":"topView","renderMakeScreen":"landscape"},"plan_entity_id":"786589"}
```

Response Payload:

```
{
    "status": "ok",
    "data": {
        "id": 5545,
        "config": {
            "type": "perspective",
            "fov": 40,
            "pan": 0,
            "tilt": 1.57,
            "distance": 4990.001588517358,
            "position": {
                "x": 0,
                "y": 5000,
                "z": 0.0091185089394763
            },
            "anchor": {
                "x": 0,
                "y": 10,
                "z": -3.9725150447268405
            },
            "rotation": {
                "x": -1.57,
                "y": 0,
                "z": 0
            },
            "pano": {
                "id": "#ffffff",
                "previewImgSrc": "",
                "rotation": 0
            },
            "renderMakeType": "topView",
            "renderMakeScreen": "landscape"
        },
        "previewUrl": "/files/plans/7865/786589/c14d12128411430696bbccb1dd32dcc5.jpg"
    }
}
```

### DELETE https://roomtodo.com/api2/render-camera-views/5545

Response Payload:

```
{
    "status": "ok",
    "data": {
        "success": true
    }
}
```
