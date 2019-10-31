module Playground3d exposing
    ( Point
    , Point3d
    , Vector
    , cuboid
    , cuboidExtra
    , from3dTo2d
    , move3d
    , movePolyline
    , piramid
    , point
    , redLight
    , rotatePolyline
    , scalePolyline
    , vector
    )

import Angle
import Axis3d
import Camera3d
import Direction3d
import Length
import Playground exposing (..)
import Point2d
import Point3d
import Point3d.Projection
import Polyline3d
import Rectangle2d
import Vector3d
import Viewpoint3d


type alias Number =
    Float


type alias Point3d =
    { x : Float, y : Float, z : Float }


move3d :
    Vector a
    -> Point a
    -> Point3d
move3d displacement point_ =
    Point3d.toRecord Length.inMeters <|
        Point3d.translateBy
            displacement
            point_


movePolyline :
    Vector3d.Vector3d Length.Meters coordinates
    -> Polyline3d.Polyline3d Length.Meters coordinates
    -> Polyline3d.Polyline3d Length.Meters coordinates
movePolyline =
    Polyline3d.translateBy


scalePolyline :
    Point3d.Point3d Length.Meters coordinates
    -> Float
    -> Polyline3d.Polyline3d Length.Meters coordinates
    -> Polyline3d.Polyline3d Length.Meters coordinates
scalePolyline =
    Polyline3d.scaleAbout


rotatePolyline :
    Axis3d.Axis3d Length.Meters coordinates
    -> Angle.Angle
    -> Polyline3d.Polyline3d Length.Meters coordinates
    -> Polyline3d.Polyline3d Length.Meters coordinates
rotatePolyline =
    Polyline3d.rotateAround


vector : Float -> Float -> Float -> Vector a
vector =
    Vector3d.meters


point : Float -> Float -> Float -> Point a
point =
    Point3d.meters


type alias Point a =
    Point3d.Point3d Length.Meters a


type alias Vector a =
    Vector3d.Vector3d Length.Meters a


projectPoint :
    { a | devMode : Bool }
    -> Computer
    -> Point3d.Point3d Length.Meters a
    -> Maybe (Point2d.Point2d Length.Meters a)
projectPoint model computer point3d =
    let
        cameraViewpoint : Computer -> Viewpoint3d.Viewpoint3d Length.Meters a
        cameraViewpoint computer_ =
            Viewpoint3d.lookAt
                { eyePoint =
                    if model.devMode && computer_.keyboard.enter then
                        point 500 500 4000

                    else if model.devMode && computer_.keyboard.shift then
                        point 2000 2000 4000

                    else
                        point
                            (wave 2250 2340 13 computer_.time)
                            (wave 2250 2350 7 computer_.time)
                            (wave 20 60 3 computer_.time)
                , focalPoint =
                    if model.devMode && computer_.keyboard.enter then
                        point 0 0 -100000

                    else if model.devMode && computer_.keyboard.shift then
                        point 0 0 0

                    else
                        -- center = -380
                        point 0 0 (wave (-380 - 40) (-380 + 40) 5 computer_.time)
                , upDirection = Direction3d.positiveZ
                }

        perspectiveCamera : Computer -> Camera3d.Camera3d Length.Meters a
        perspectiveCamera computer_ =
            Camera3d.perspective
                { viewpoint = cameraViewpoint computer_
                , verticalFieldOfView =
                    Angle.degrees
                        (if model.devMode && computer_.keyboard.enter then
                            -20

                         else if model.devMode && computer_.keyboard.shift then
                            -40

                         else
                            -40
                        )
                , clipDepth = Length.meters 1
                }

        rectOfView : Rectangle2d.Rectangle2d Length.Meters a
        rectOfView =
            Rectangle2d.with
                { x1 = Length.meters 0
                , y1 = Length.meters 600
                , x2 = Length.meters 1
                , y2 = Length.meters 0
                }
    in
    Point3d.Projection.toScreenSpace
        (perspectiveCamera computer)
        rectOfView
        point3d


from3dTo2d :
    { a | devMode : Bool }
    -> Computer
    -> List (Point3d.Point3d Length.Meters a)
    -> List ( Number, Number )
from3dTo2d model computer points =
    List.map
        (\point_ ->
            case projectPoint model computer point_ of
                Just p ->
                    Point2d.toTuple Length.inMeters p

                Nothing ->
                    Point2d.toTuple Length.inMeters <| Point2d.meters 0 0
        )
        points


cuboid :
    { a | devMode : Bool }
    -> Computer
    -> { b | x : Float, y : Float, z : Float }
    -> { c | x : Float, y : Float, z : Float }
    -> { d | a : Color, b : Color }
    -> List Shape
cuboid model computer pos size color =
    let
        sideA =
            [ point (pos.x + size.x) pos.y pos.z
            , point (pos.x + size.x) (pos.y + size.y) pos.z
            , point (pos.x + size.x) (pos.y + size.y) (pos.z + size.z)
            , point (pos.x + size.x) pos.y (pos.z + size.z)
            ]

        sideB =
            [ point pos.x (pos.y + size.y) pos.z
            , point (pos.x + size.x) (pos.y + size.y) pos.z
            , point (pos.x + size.x) (pos.y + size.y) (pos.z + size.z)
            , point pos.x (pos.y + size.y) (pos.z + size.z)
            ]
    in
    [ polygon color.a (from3dTo2d model computer sideA)
    , polygon color.b (from3dTo2d model computer sideB)
    ]


redLight :
    Bool
    -> { a | devMode : Bool }
    -> Computer
    -> { b | x : Float, y : Float, z : Float }
    -> List Shape
redLight day model computer pos =
    let
        size =
            { x = 20, y = 20, z = 15 }

        sideA =
            [ point (pos.x + size.x) pos.y pos.z
            , point (pos.x + size.x) (pos.y + size.y) pos.z
            , point (pos.x + size.x) (pos.y + size.y) (pos.z + size.z)
            , point (pos.x + size.x) pos.y (pos.z + size.z)
            ]
    in
    if day then
        []

    else
        [ fade (wave 0 1 2 computer.time) <| polygon red (from3dTo2d model computer sideA) ]


cuboidExtra :
    { a | devMode : Bool }
    -> Computer
    -> Float
    -> { b | x : Float, y : Float, z : Float }
    -> { c | x : Float, y : Float, z : Float }
    -> { d | a : Color, b : Color }
    -> List Shape
cuboidExtra model computer extraHeight pos size color =
    let
        sideA =
            [ point (pos.x + size.x) pos.y (pos.z + extraHeight)
            , point (pos.x + size.x) (pos.y + size.y) (pos.z + extraHeight)
            , point (pos.x + size.x) (pos.y + size.y) (pos.z + extraHeight + size.z)
            , point (pos.x + size.x) pos.y (pos.z + extraHeight + size.z)
            ]

        sideB =
            [ point pos.x (pos.y + size.y) (pos.z + extraHeight)
            , point (pos.x + size.x) (pos.y + size.y) (pos.z + extraHeight)
            , point (pos.x + size.x) (pos.y + size.y) (pos.z + extraHeight + size.z)
            , point pos.x (pos.y + size.y) (pos.z + extraHeight + size.z)
            ]
    in
    [ polygon color.a (from3dTo2d model computer sideA)
    , polygon color.b (from3dTo2d model computer sideB)
    ]


piramid :
    { a | devMode : Bool }
    -> Computer
    -> { b | x : Float, y : Float, z : Float }
    -> { c | x : Float, y : Float, z : Float }
    -> { d | a : Color, b : Color }
    -> List Shape
piramid model computer pos size color =
    let
        sideA =
            [ point (pos.x + size.x) pos.y pos.z
            , point (pos.x + size.x) (pos.y + size.y) pos.z
            , point (pos.x + size.x - size.y / 2) (pos.y + size.y / 2) (pos.z + size.z)
            ]

        sideB =
            [ point pos.x (pos.y + size.y) pos.z
            , point (pos.x + size.x) (pos.y + size.y) pos.z
            , point (pos.x + size.x / 2) (pos.y + size.y - size.x / 2) (pos.z + size.z)
            ]
    in
    [ polygon color.a (from3dTo2d model computer sideA)
    , polygon color.b (from3dTo2d model computer sideB)
    ]
