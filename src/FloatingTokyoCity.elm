module FloatingTokyoCity exposing
    ( Model
    , TimeOfDay(..)
    , init
    , main
    , palette
    , subscriptions
    , update
    , view
    )

import Angle
import Axis3d
import Browser
import Playground exposing (..)
import Playground3d exposing (..)
import Polyline3d
import Set


tokyoTower : Model -> Computer -> Vector a -> List Shape
tokyoTower model computer vector_ =
    piramid model computer (move3d vector_ (point 0 0 0)) { x = 100, y = 100, z = 300 } { a = lightRed, b = darkRed }
        ++ cuboid model computer (move3d vector_ (point 25 25 200)) { x = 50, y = 50, z = 20 } { a = lightGray, b = grey }
        ++ piramid model computer (move3d vector_ (point 35 35 220)) { x = 30, y = 30, z = 200 } { a = lightRed, b = darkRed }
        ++ cuboid model computer (move3d vector_ (point 45 45 350)) { x = 10, y = 10, z = 50 } { a = lightGray, b = grey }
        ++ cuboid model computer (move3d vector_ (point 45 45 400)) { x = 10, y = 10, z = 50 } { a = lightRed, b = darkRed }


sumidaTower : Model -> Computer -> Vector a -> List Shape
sumidaTower model computer vector_ =
    let
        fade1 =
            if model.timeOfDay == Night then
                zigzag 0.2 1 3 computer.time

            else
                1
    in
    piramid model computer (move3d vector_ (point 0 0 0)) { x = 80, y = 80, z = 500 } (.buildingDistant (palette model.timeOfDay))
        ++ [ fade fade1 <| group <| cuboid model computer (move3d vector_ (point 20 20 300)) { x = 40, y = 40, z = 40 } (.buildingDistantLight (palette model.timeOfDay)) ]
        ++ [ fade fade1 <| group <| cuboid model computer (move3d vector_ (point 25 25 400)) { x = 30, y = 30, z = 30 } (.buildingDistantLight (palette model.timeOfDay)) ]
        ++ cuboid model computer (move3d vector_ (point 35 35 450)) { x = 10, y = 10, z = 100 } (.buildingDistant (palette model.timeOfDay))


easeOutQuart : number -> number
easeOutQuart t =
    t * (2 - t)


easeOutQuart2 : Float -> Float
easeOutQuart2 t =
    (t ^ 1.1) * (2 - t)


easeOutQuart3 : Float -> Float
easeOutQuart3 t =
    (t ^ 1.2) * (2 - t)


extraHeight1 : GameState -> Float
extraHeight1 gameState =
    let
        fade_ =
            startFading gameState
    in
    (1 - easeOutQuart fade_) * 1500


extraHeight2 : GameState -> Float
extraHeight2 gameState =
    let
        fade_ =
            startFading gameState
    in
    (1 - easeOutQuart2 fade_) * 1500


extraHeight3 : GameState -> Float
extraHeight3 gameState =
    let
        fade_ =
            startFading gameState
    in
    (1 - easeOutQuart3 fade_) * 1500


hyattPark : Model -> Computer -> Vector a -> List Shape
hyattPark model computer vector_ =
    piramid model computer (move3d vector_ <| point 0 0 <| 500 + extraHeight1 model.gameState) { x = 50, y = 50, z = 50 } (.buildingBrown (palette model.timeOfDay))
        ++ piramid model computer (move3d vector_ <| point 0 100 <| 550 + extraHeight2 model.gameState) { x = 50, y = 50, z = 50 } (.buildingBrown (palette model.timeOfDay))
        ++ piramid model computer (move3d vector_ <| point 0 200 <| 600 + extraHeight3 model.gameState) { x = 50, y = 50, z = 50 } (.buildingBrown (palette model.timeOfDay))
        ++ cuboidExtra model computer 0 (move3d vector_ (point 0 0 (extraHeight1 model.gameState))) { x = 70, y = 70, z = 500 } (.buildingBrown (palette model.timeOfDay))
        ++ cuboid model computer (move3d vector_ <| point 0 100 (extraHeight2 model.gameState)) { x = 70, y = 70, z = 550 } (.buildingBrown (palette model.timeOfDay))
        ++ cuboid model computer (move3d vector_ <| point 0 200 (extraHeight3 model.gameState)) { x = 70, y = 70, z = 600 } (.buildingBrown (palette model.timeOfDay))


landmarkTower : Model -> Computer -> Vector a -> List Shape
landmarkTower model computer vector_ =
    piramid model computer (move3d vector_ (point 0 0 0)) { x = 200, y = 200, z = 600 } (.buildingDistant (palette model.timeOfDay))
        ++ cuboid model computer (move3d vector_ (point 50 50 0)) { x = 100, y = 100, z = 600 } (.buildingDistant (palette model.timeOfDay))
        ++ redLight (model.timeOfDay == Day) model computer (move3d vector_ (point 70 50 610))


nttTower : Model -> Computer -> Vector a -> List Shape
nttTower model computer vector_ =
    cuboid model computer (move3d vector_ (point 40 40 490)) { x = 10, y = 10, z = 100 } (.buildingMetropolitan (palette model.timeOfDay))
        ++ cuboid model computer (move3d vector_ (point 0 0 480)) { x = 30, y = 30, z = 30 } (.buildingNTT (palette model.timeOfDay))
        ++ cuboid model computer (move3d vector_ (point 0 0 450)) { x = 50, y = 50, z = 30 } (.buildingNTT (palette model.timeOfDay))
        ++ cuboid model computer (move3d vector_ (point 0 0 400)) { x = 60, y = 60, z = 50 } (.buildingNTT (palette model.timeOfDay))
        ++ cuboid model computer (move3d vector_ (point 0 0 0)) { x = 80, y = 80, z = 400 } (.buildingNTT (palette model.timeOfDay))
        ++ redLight (model.timeOfDay == Day) model computer { x = 80, y = 90, z = 580 }


metropolitanBuilding : Model -> Computer -> Vector a -> List Shape
metropolitanBuilding model computer vector_ =
    cuboid model computer (move3d vector_ (point 0 0 0)) { x = 70, y = 70, z = 600 } (.buildingMetropolitan (palette model.timeOfDay))
        ++ cuboid model computer (move3d vector_ (point 70 0 0)) { x = 80, y = 50, z = 450 } (.buildingMetropolitan (palette model.timeOfDay))
        ++ cuboid model computer (move3d vector_ (point 150 0 0)) { x = 70, y = 70, z = 600 } (.buildingMetropolitan (palette model.timeOfDay))
        ++ redLight (model.timeOfDay == Day) model computer (move3d vector_ (point 158 10 610))


train : Model -> Computer -> Vector a -> List Shape
train model computer vector_ =
    let
        trainPosition =
            if wave 100 900 40 computer.time < 500 then
                wave 100 900 20 computer.time

            else
                100
    in
    cuboid model computer (move3d vector_ (point 200 0 0)) { x = 20, y = 20, z = 80 } { a = darkGray, b = charcoal }
        ++ cuboid model computer (move3d vector_ (point 400 0 0)) { x = 20, y = 20, z = 80 } { a = darkGray, b = charcoal }
        ++ cuboid model computer (move3d vector_ (point 600 0 0)) { x = 20, y = 20, z = 80 } { a = darkGray, b = charcoal }
        ++ cuboid model computer (move3d vector_ (point 800 0 0)) { x = 20, y = 20, z = 80 } { a = darkGray, b = charcoal }
        --
        ++ cuboid model computer (move3d vector_ (point 100 0 70)) { x = 900, y = 10, z = 10 } { a = darkGray, b = charcoal }
        ++ cuboid model computer (move3d vector_ (point trainPosition 0 80)) { x = 50, y = 10, z = 10 } { a = red, b = darkRed }


interactiveData : Computer -> { angle : Float, letterEHorizontal : Float, letterEVertical : Float }
interactiveData computer =
    { letterEHorizontal = clamp -180 0 ((200 - computer.mouse.x) * 0.3)
    , letterEVertical = clamp -100 80 ((100 + computer.mouse.y) * 0.6)
    , angle = zigzag 90 0 15 computer.time
    }


scaleLettersRatio : Float
scaleLettersRatio =
    4


letters :
    { e : List (Point a)
    , l : List (Point a)
    , m : List (Point a)
    }
letters =
    { e =
        [ point 0 0 0
        , point 8 0 0
        , point 8 0 2
        , point 2 0 2
        , point 2 0 6
        , point 6 0 6
        , point 6 0 8
        , point 2 0 8
        , point 2 0 10
        , point 8 0 10
        , point 8 0 12
        , point 0 0 12
        ]
    , l =
        [ point 10 0 0
        , point 12 0 0
        , point 12 0 12
        , point 10 0 12
        ]
    , m =
        [ point 14 0 0
        , point 16 0 0
        , point 16 0 5
        , point 17 0 6
        , point 18 0 6
        , point 18 0 0
        , point 20 0 0
        , point 20 0 5
        , point 21 0 6
        , point 22 0 6
        , point 22 0 0
        , point 24 0 0
        , point 24 0 7
        , point 23 0 8
        , point 21 0 8
        , point 20 0 7
        , point 19 0 8
        , point 17 0 8
        , point 16 0 7
        , point 16 0 8
        , point 14 0 8
        ]
    }


rotatingCrane : Model -> Computer -> Bool -> Vector a -> List Shape
rotatingCrane model computer isGameOver_ vector_ =
    let
        interactiveData_ =
            if isGameOver_ then
                { letterEHorizontal = 0
                , letterEVertical = 0
                , angle = 0
                }

            else
                interactiveData computer

        angleDegrees =
            Angle.degrees interactiveData_.angle

        scaleCraneRatio =
            1.2

        position =
            { x = 800, y = 400, z = 0 }

        craneProcessing polyline_ =
            polyline_
                |> Polyline3d.fromVertices
                |> rotatePolyline Axis3d.z angleDegrees
                |> scalePolyline (point 0 0 0) scaleCraneRatio
                |> movePolyline (vector position.x position.y position.z)
                |> Polyline3d.vertices

        letterOnCrane letter =
            letter
                |> Polyline3d.fromVertices
                |> rotatePolyline (Axis3d.moveTo (point 4 0 0) Axis3d.z) (Angle.degrees (spin 2 computer.time))
                |> scalePolyline (point 0 0 0) (scaleLettersRatio / scaleCraneRatio)
                |> movePolyline (vector 215 0 (210 - (12 * scaleLettersRatio)))
                |> movePolyline (vector interactiveData_.letterEHorizontal 0 0)
                |> movePolyline (vector 0 0 interactiveData_.letterEVertical)
                |> Polyline3d.vertices

        ropeProcessing =
            craneRope (200 + interactiveData_.letterEVertical)
                |> Polyline3d.fromVertices
                |> movePolyline (vector interactiveData_.letterEHorizontal 0 0)
                |> Polyline3d.vertices

        craneRope height =
            [ point 230 -2 300, point 230 2 300, point 230 2 height, point 230 -2 height ]

        craneHorizontalPart =
            [ point -30 -5 300
            , point -30 5 300
            , point 250 5 300
            , point 250 -5 300
            ]

        craneHorizontalPartVertical =
            [ point -30 0 300
            , point -30 0 310
            , point 250 0 310
            , point 250 0 300
            ]
    in
    cuboid model computer (move3d vector_ (point position.x position.y position.z)) { x = 10, y = 10, z = 400 } { a = lightRed, b = darkRed }
        ++ [ polygon darkRed (from3dTo2d model computer (craneProcessing craneHorizontalPart))
           , polygon darkRed (from3dTo2d model computer (craneProcessing craneHorizontalPartVertical))
           , fade 0.1 <| polygon black (from3dTo2d model computer (craneProcessing ropeProcessing))
           ]
        ++ (if isGameOver_ then
                []

            else
                [ polygon (.elm (palette model.timeOfDay)) (from3dTo2d model computer (craneProcessing (letterOnCrane letters.e))) ]
           )


shapes :
    { star : List (Point a)
    }
shapes =
    { star =
        [ point 0 0 0
        , point 1 0 0
        , point 1 0 1
        , point 0 0 1
        ]
    }


billboard : Model -> Computer -> Bool -> Float -> List Shape
billboard model computer showAll fadeValue =
    let
        letterOnBillboard letter =
            letter
                |> Polyline3d.fromVertices
                |> rotatePolyline Axis3d.z (Angle.degrees 180)
                |> scalePolyline (point 0 0 0) scaleLettersRatio
                |> movePolyline (vector 1000 400 210)
                |> Polyline3d.vertices

        shapesOnBillboard shape =
            shape
                |> Polyline3d.fromVertices
                |> rotatePolyline (Axis3d.moveTo (point 0.5 0 0.5) Axis3d.y) (Angle.degrees (180 - (fadeValue * 1500)))
                |> scalePolyline (point 0 0 0) (fadeValue * 100)
                |> movePolyline (vector 950 (400 + 400 * fadeValue) 210)
                |> Polyline3d.vertices

        shapesOnBillboard2 shape =
            shape
                |> Polyline3d.fromVertices
                |> rotatePolyline (Axis3d.moveTo (point 0.5 0 0.5) Axis3d.y) (Angle.degrees (180 + (fadeValue * 1000)))
                |> scalePolyline (point 0 0 0) (fadeValue * 100)
                |> movePolyline (vector 950 (400 - 400 * fadeValue) 210)
                |> Polyline3d.vertices

        shapesOnBillboard3 shape =
            shape
                |> Polyline3d.fromVertices
                |> rotatePolyline (Axis3d.moveTo (point 0.5 0 0.5) Axis3d.y) (Angle.degrees (180 + (fadeValue * 1000)))
                |> scalePolyline (point 0 0 0) (fadeValue * 100)
                |> movePolyline (vector 950 400 (210 - 400 * fadeValue))
                |> Polyline3d.vertices

        shapesOnBillboard4 shape =
            shape
                |> Polyline3d.fromVertices
                |> rotatePolyline (Axis3d.moveTo (point 0.5 0 0.5) Axis3d.y) (Angle.degrees (180 + (fadeValue * 1000)))
                |> scalePolyline (point 0 0 0) (fadeValue * 100)
                |> movePolyline (vector 950 400 (210 + 400 * fadeValue))
                |> Polyline3d.vertices

        fade2 =
            if showAll then
                wave 0.5 1 2 computer.time

            else
                let
                    angle =
                        spin 1 computer.time
                            + spin 7 computer.time
                in
                if angle < 20 || (35 < angle && angle < 100) || (150 < angle && angle < 170) then
                    0.2

                else
                    1
    in
    [ fade
        (if showAll then
            fade2

         else
            0.1
        )
      <|
        fade fade2 <|
            polygon (.elm (palette model.timeOfDay)) (from3dTo2d model computer (letterOnBillboard letters.e))
    , fade fade2 <| polygon (.elm (palette model.timeOfDay)) (from3dTo2d model computer (letterOnBillboard letters.l))
    , fade fade2 <| polygon (.elm (palette model.timeOfDay)) (from3dTo2d model computer (letterOnBillboard letters.m))

    -- Stars when the E is positioned in the right place
    , fade (1 - fadeValue) <| polygon yellow (from3dTo2d model computer (shapesOnBillboard shapes.star))
    , fade (1 - fadeValue) <| polygon lightBlue (from3dTo2d model computer (shapesOnBillboard2 shapes.star))
    , fade (1 - fadeValue) <| polygon lightGreen (from3dTo2d model computer (shapesOnBillboard3 shapes.star))
    , fade (1 - fadeValue) <| polygon lightRed (from3dTo2d model computer (shapesOnBillboard4 shapes.star))
    ]


surface : Model -> Computer -> List Shape
surface model computer =
    [ polygon lightOrange
        (from3dTo2d model
            computer
            [ point 0 0 0
            , point 1000 0 0
            , point 1000 1000 0
            , point 0 1000 0
            ]
        )
    ]


crow : Model -> Computer -> Point3d -> Number -> List Shape
crow model computer delta cycle =
    cuboid model
        computer
        { x = 500 + delta.x + 500 * sin (degrees (spin 43 computer.time))
        , y = 500 + delta.y + 500 * cos (degrees (spin 47 computer.time))
        , z = wave 300 400 cycle computer.time
        }
        { x = 5, y = 5, z = 5 }
        { a = darkCharcoal, b = charcoal }


crowsFlock : Model -> Computer -> List Shape
crowsFlock model computer =
    [ fade 0.3 <|
        group <|
            crow model computer { x = 0, y = 0, z = 0 } 18
                ++ crow model computer { x = 25, y = 0, z = 0 } 19
                ++ crow model computer { x = 25, y = 25, z = 0 } 20
                ++ crow model computer { x = 0, y = 25, z = 0 } 21
                ++ crow model computer { x = 50, y = 0, z = 0 } 22
                ++ crow model computer { x = 50, y = 50, z = 0 } 23
                ++ crow model computer { x = 0, y = 50, z = 0 } 24
    ]


colors :
    { nightLight : Color
    , nightDark : Color
    }
colors =
    { nightLight = Playground.rgb 60 60 70
    , nightDark = Playground.rgb 30 30 40
    }


palette :
    TimeOfDay
    ->
        { backgroundRgb : ( Float, Float, Float )
        , base : { a : Color, b : Color }
        , buildingBlue : { a : Color, b : Color }
        , buildingBrown : { a : Color, b : Color }
        , buildingDistant : { a : Color, b : Color }
        , buildingDistantLight : { a : Color, b : Color }
        , buildingMetropolitan : { a : Color, b : Color }
        , buildingPurpleOrange : { a : Color, b : Color }
        , buildingYellowGreen : { a : Color, b : Color }
        , buildingNTT : { a : Color, b : Color }
        , buildingYellow : { a : Color, b : Color }
        , elm : Color
        , fuji : { a : Color, b : Color }
        , fujiSnow : { a : Color, b : Color }
        }
palette timeOfDay =
    case timeOfDay of
        Sunrise ->
            { backgroundRgb = ( 100, 100, 120 )
            , fuji = { a = Playground.rgb 220 220 240, b = Playground.rgb 80 80 100 }
            , fujiSnow = { a = Playground.rgb 240 240 260, b = Playground.rgb 140 140 160 }
            , base = { a = Playground.rgb 200 200 220, b = Playground.rgb 60 60 80 }
            , buildingBrown = { a = Playground.rgb 220 220 240, b = Playground.rgb 100 100 120 }
            , buildingYellowGreen = { a = Playground.rgb 220 220 240, b = Playground.rgb 100 100 120 }
            , buildingBlue = { a = Playground.rgb 220 220 240, b = Playground.rgb 100 100 120 }
            , buildingDistant = { a = Playground.rgb 220 220 240, b = Playground.rgb 100 100 120 }
            , buildingDistantLight = { a = Playground.rgb 240 240 260, b = Playground.rgb 140 140 160 }
            , buildingPurpleOrange = { a = Playground.rgb 220 220 240, b = Playground.rgb 100 100 120 }
            , buildingMetropolitan = { a = Playground.rgb 220 220 240, b = Playground.rgb 100 100 120 }
            , buildingNTT = { a = Playground.rgb 220 220 240, b = Playground.rgb 100 100 120 }
            , buildingYellow = { a = Playground.rgb 220 220 240, b = Playground.rgb 100 100 120 }
            , elm = lightGray
            }

        Day ->
            { backgroundRgb = ( 40, 190, 210 )
            , fuji = { a = Playground.rgb 10 160 180, b = Playground.rgb 10 160 180 }
            , fujiSnow = { a = Playground.rgb 255 255 255, b = Playground.rgb 220 220 220 }
            , base = { a = gray, b = Playground.rgb 20 170 190 }
            , buildingBrown = { a = lightBrown, b = darkBrown }
            , buildingYellowGreen = { a = yellow, b = darkGreen }
            , buildingBlue = { a = lightBlue, b = blue }
            , buildingDistant = { a = Playground.rgb 60 210 230, b = Playground.rgb 20 170 190 }
            , buildingDistantLight = { a = lightGray, b = gray }
            , buildingPurpleOrange = { a = lightOrange, b = purple }
            , buildingMetropolitan = { a = gray, b = lightBlue }
            , buildingNTT = { a = lightPurple, b = purple }
            , buildingYellow = { a = yellow, b = darkYellow }
            , elm = blue
            }

        Sunset ->
            { backgroundRgb = ( 200, 150, 100 )
            , fuji = { a = red, b = darkRed }
            , fujiSnow = { a = Playground.rgb 255 255 255, b = Playground.rgb 220 220 220 }
            , base = { a = Playground.rgb 170 120 70, b = Playground.rgb 230 180 130 }
            , buildingBrown = { a = darkBrown, b = lightBrown }
            , buildingYellowGreen = { a = darkBrown, b = lightBrown }
            , buildingBlue = { a = darkBrown, b = lightBrown }
            , buildingDistant = { a = darkBrown, b = lightBrown }
            , buildingDistantLight = { a = lightGray, b = gray }
            , buildingPurpleOrange = { a = darkBrown, b = lightBrown }
            , buildingMetropolitan = { a = darkBrown, b = lightBrown }
            , buildingNTT = { a = darkBrown, b = lightBrown }
            , buildingYellow = { a = darkBrown, b = lightBrown }
            , elm = lightGray
            }

        Night ->
            { backgroundRgb = ( 20, 20, 20 )
            , fuji = { a = Playground.rgb 60 60 80, b = Playground.rgb 40 40 60 }
            , fujiSnow = { a = Playground.rgb 100 100 120, b = Playground.rgb 80 80 100 }
            , base = { a = Playground.rgb 35 35 45, b = Playground.rgb 30 30 30 }
            , buildingBrown = { a = colors.nightLight, b = colors.nightDark }
            , buildingYellowGreen = { a = colors.nightLight, b = colors.nightDark }
            , buildingBlue = { a = colors.nightLight, b = colors.nightDark }
            , buildingDistant = { a = colors.nightLight, b = colors.nightDark }
            , buildingDistantLight = { a = lightGray, b = gray }
            , buildingPurpleOrange = { a = colors.nightLight, b = colors.nightDark }
            , buildingMetropolitan = { a = colors.nightLight, b = colors.nightDark }
            , buildingNTT = { a = colors.nightLight, b = colors.nightDark }
            , buildingYellow = { a = colors.nightLight, b = colors.nightDark }
            , elm = lightGray
            }


viewGame : Computer -> Model -> Number -> List Shape
viewGame computer model fadeValue =
    [ fade fadeValue <|
        group <|
            [ moveUp 180 <|
                group <|
                    surface model computer
                        -- Fuji-san
                        ++ piramid model computer { x = -1500, y = -1500, z = 0 } { x = 1500, y = 1500, z = 500 } (.fuji (palette model.timeOfDay))
                        ++ piramid model computer { x = -1000, y = -1000, z = 334 } { x = 500, y = 500, z = 166 } (.fujiSnow (palette model.timeOfDay))
                        -- Landmark Tower
                        ++ landmarkTower model computer (vector 0 -1000 (extraHeight2 model.gameState))
                        -- NTT Tower
                        ++ nttTower model computer (vector 0 0 (extraHeight2 model.gameState))
                        -- Metropolitan Building
                        ++ metropolitanBuilding model computer (vector 200 0 (extraHeight1 model.gameState))
                        -- Old Crane
                        -- ++ crane model computer { x = 800, y = 0, z = 0 }
                        -- Sumida Tower
                        ++ sumidaTower model computer (vector -1000 0 (extraHeight3 model.gameState))
                        -- Hyatt Park
                        ++ hyattPark model computer (vector 0 300 0)
                        ++ tokyoTower model computer (vector 400 500 (extraHeight2 model.gameState))
                        --
                        -- Building at the edges
                        ++ cuboid model computer { x = 900, y = 0, z = extraHeight1 model.gameState } { x = 100, y = 200, z = 100 } (.buildingPurpleOrange (palette model.timeOfDay))
                        ++ cuboid model computer { x = 0, y = 900, z = extraHeight2 model.gameState } { x = 100, y = 100, z = 100 } (.buildingPurpleOrange (palette model.timeOfDay))
                        -- Yellow/Green building in front of Crane
                        ++ cuboid model computer { x = 900, y = 300, z = extraHeight3 model.gameState } { x = 100, y = 100, z = 200 } (.buildingYellowGreen (palette model.timeOfDay))
                        -- Crane
                        ++ rotatingCrane model computer (isGameOver model.gameState) (vector 0 0 0)
                        -- Billboard
                        ++ billboard model computer (isGameOver model.gameState) 0
                        -- Low building in front of Elm building
                        ++ cuboid model computer { x = 900, y = 550, z = extraHeight2 model.gameState } { x = 150, y = 50, z = 100 } (.buildingNTT (palette model.timeOfDay))
                        -- Blue bilding on the left
                        ++ cuboid model computer { x = 900, y = 600, z = extraHeight3 model.gameState } { x = 100, y = 100, z = 150 } (.buildingBlue (palette model.timeOfDay))
                        -- Yellow buildings
                        ++ cuboid model computer { x = 800, y = 700, z = extraHeight1 model.gameState } { x = 150, y = 50, z = 200 } (.buildingYellow (palette model.timeOfDay))
                        ++ cuboid model computer { x = 300, y = 900, z = extraHeight2 model.gameState } { x = 150, y = 150, z = 50 } (.buildingYellowGreen (palette model.timeOfDay))
                        ++ cuboid model computer { x = 600, y = 900, z = extraHeight3 model.gameState } { x = 50, y = 150, z = 250 } (.buildingBlue (palette model.timeOfDay))
                        -- Train
                        ++ train model computer (vector 0 950 0)
                        ++ cuboid model computer { x = 900, y = 900, z = extraHeight2 model.gameState } { x = 100, y = 100, z = 100 } (.buildingPurpleOrange (palette model.timeOfDay))
                        ++ cuboid model computer { x = 700, y = 1000, z = extraHeight3 model.gameState } { x = 100, y = 50, z = 180 } (.buildingYellowGreen (palette model.timeOfDay))
                        -- Crows
                        ++ crowsFlock model computer
                        ++ cuboid model computer { x = 0, y = 0, z = -120 } { x = 1100, y = 1100, z = 130 } (.base (palette model.timeOfDay))
                        ++ cuboid model computer { x = 0, y = 0, z = -260 } { x = 800, y = 800, z = 80 } (.base (palette model.timeOfDay))
                        ++ cuboid model computer { x = 0, y = 0, z = -345 } { x = 700, y = 700, z = 50 } (.base (palette model.timeOfDay))
                        ++ cuboid model computer { x = 0, y = 0, z = -420 } { x = 600, y = 600, z = 30 } (.base (palette model.timeOfDay))
                        ++ (if model.devMode then
                                [ moveDown 100 <|
                                    scale 2 <|
                                        words black <|
                                            "dev"
                                ]

                            else
                                []
                           )
            ]
    ]


view3d : Computer -> Model -> List Shape
view3d computer model =
    case model.gameState of
        Playing fadeValue ->
            viewGame computer model fadeValue

        Won fadeValue ->
            [ -- fade (1 - fadeValue) <|
              moveUp 180 <|
                group <|
                    billboard model computer True fadeValue
            ]

        GameOver fadeValue ->
            viewGame computer model fadeValue


type alias Model =
    { gameState : GameState
    , timeOfDay : TimeOfDay
    , qrCode : Bool
    , devMode : Bool
    }


goal : Computer -> Bool
goal computer =
    let
        data =
            interactiveData computer

        limit =
            5
    in
    abs (-70 - data.letterEHorizontal)
        < limit
        && abs (14 - data.letterEVertical)
        < limit
        && abs data.angle
        < limit


isGameOver : GameState -> Bool
isGameOver gameState =
    case gameState of
        GameOver _ ->
            True

        _ ->
            False


type GameState
    = Playing Float
    | Won Float
    | GameOver Float


startFading : GameState -> Float
startFading gameState =
    case gameState of
        Playing fadeValue ->
            fadeValue

        _ ->
            1


type TimeOfDay
    = Day
    | Sunset
    | Night
    | Sunrise


update3d : Computer -> Model -> Model
update3d computer model =
    let
        model1 =
            if computer.keyboard.keys == Set.fromList [ "d", "e", "v" ] then
                { model | devMode = True }

            else
                model

        model2 =
            case Set.toList computer.keyboard.keys of
                [ "1" ] ->
                    { model1 | timeOfDay = Sunrise }

                [ "2" ] ->
                    { model1 | timeOfDay = Day }

                [ "3" ] ->
                    { model1 | timeOfDay = Sunset }

                [ "4" ] ->
                    { model1 | timeOfDay = Night }

                [ "q" ] ->
                    { model1 | qrCode = True }

                [ "Escape" ] ->
                    { model1 | qrCode = False }

                _ ->
                    model1
    in
    case model2.gameState of
        Playing fadeValue ->
            if goal computer then
                { model2 | gameState = Won 0 }

            else if fadeValue < 1 then
                { model2 | gameState = Playing (fadeValue + 0.01) }

            else
                model2

        Won fadeValue ->
            if fadeValue < 1 then
                { model2 | gameState = Won (fadeValue + 0.03) }

            else
                { model2 | gameState = GameOver 0 }

        GameOver fadeValue ->
            if fadeValue < 1 then
                { model2 | gameState = GameOver (fadeValue + 0.03) }

            else
                model2


viewMemory : Computer -> Model -> List Shape
viewMemory =
    view3d


updateMemory : Computer -> Model -> Model
updateMemory =
    update3d


initialMemory : Model
initialMemory =
    { gameState = Playing 0
    , timeOfDay = Day
    , devMode = False
    , qrCode = False
    }


init : ( Int, Int ) -> ( Game Model, Cmd Msg )
init =
    Playground.initGame initialMemory


view : Game Model -> Browser.Document Msg
view =
    Playground.viewGame viewMemory


update : Msg -> Game Model -> ( Game Model, Cmd Msg )
update =
    Playground.updateGame updateMemory


subscriptions : Game Model -> Sub Msg
subscriptions =
    Playground.subscriptionsGame


main : Program ( Int, Int ) (Game Model) Msg
main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
