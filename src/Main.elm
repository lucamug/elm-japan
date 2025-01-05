port module Main exposing (main)

import Browser
import Browser.Events
import Browser.Navigation
import Counter
import Counter.View
import Element exposing (..)
import Element.Background as Background
import Element.Border as Border
import Element.Events as Events
import Element.Font as Font
import Element.Input as Input
import FloatingTokyoCity
import Html
import Html.Attributes
import Playground
import Svg
import Svg.Attributes as SA
import Time
import Url



-- From https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/
-- [ addStyle "body {height: 100vh; overflow-y: hidden;}" ]
--
-- From https://css-tricks.com/snippets/css/momentum-scrolling-on-ios-overflow-elements/
-- [ addStyle ".s.sby {overflow-y: scroll; -webkit-overflow-scrolling: touch;}" ]


linkMailingList : String
linkMailingList =
    "http://eepurl.com/gHZECb"


linkTwitter : String
linkTwitter =
    "https://twitter.com/ElmJapanConf"


handleTwitter : String
handleTwitter =
    "@elmjapanconf"


emailHello : String
emailHello =
    "hello@elmjapan.org"


emailSponsors : String
emailSponsors =
    "sponsors@elmjapan.org"


followUsOnTwitter : String
followUsOnTwitter =
    "follow " ++ handleTwitter ++ " on Twitter"


mainMargin : Int -> Int
mainMargin width =
    if width > 1000 then
        80

    else if width > 600 then
        40

    else
        20


marginAboveTitles : number
marginAboveTitles =
    0


headerHeight : Int
headerHeight =
    80


port scrollTo : String -> Cmd msg


port onblur : (() -> msg) -> Sub msg


port onfocus : (() -> msg) -> Sub msg


type Language
    = En
    | Ja


type alias Model =
    { width : Int
    , height : Int
    , menuOpen : Bool
    , language : Language
    , floatingTokyoCity : Playground.Game FloatingTokyoCity.Model
    , countdown : Counter.Counter
    , href : String
    , focused : Bool
    , pause : Bool
    , startedOnSmallDevice : Bool
    , cachedQrCodeWhite : Element Msg
    , cachedQrCodeBlack : Element Msg
    , key : Browser.Navigation.Key
    , url : Url.Url
    }


type alias Flags =
    { width : Int
    , height : Int
    , language : String
    , href : String
    }


init : Flags -> Url.Url -> Browser.Navigation.Key -> ( Model, Cmd msg )
init flags url key =
    let
        ( floatingTokyoCity, _ ) =
            FloatingTokyoCity.init ( 600, 400 )
    in
    ( { width = flags.width
      , height = flags.height
      , language =
            if flags.language == "ja" then
                Ja

            else
                En
      , menuOpen = False
      , floatingTokyoCity = floatingTokyoCity
      , countdown = Counter.start <| Counter.init
      , href = flags.href
      , focused = True
      , pause = False
      , startedOnSmallDevice = flags.width < 800
      , cachedQrCodeWhite = none
      , cachedQrCodeBlack = none
      , key = key
      , url = url
      }
        |> regenerateTheQrCode
    , Cmd.none
    )


regenerateTheQrCode : Model -> Model
regenerateTheQrCode model =
    { model
      -- | cachedQrCodeWhite = icon Icon_QRCodeWithHole "white" (min (model.width - 40) (model.height - 160))
        | cachedQrCodeBlack = icon Icon_QRCodeWithHole "black" (min (model.width - 40) (model.height - 160))
    }


type Msg
    = ToggleMenu
    | TogglePause
    | ToggleQrCode Bool
    | ChangeLanguage Language
    | ScrollTo String
    | OnResize Int Int
    | FloatingTokyoCityMsg Playground.Msg
    | ChangeTimeOfDay FloatingTokyoCity.TimeOfDay
    | OnFocus ()
    | OnBlur ()
    | TimeNow Time.Posix
    | OnAnimationFrame Time.Posix
    | OnUrlRequest Browser.UrlRequest
    | OnUrlChange Url.Url


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        OnUrlRequest urlRequest ->
            case urlRequest of
                Browser.Internal url ->
                    ( model
                    , Browser.Navigation.pushUrl model.key (Url.toString url)
                    )

                Browser.External href ->
                    ( model
                    , Browser.Navigation.load href
                    )

        OnUrlChange url ->
            ( { model | url = url }, Cmd.none )

        OnFocus _ ->
            ( { model | focused = True }, Cmd.none )

        OnBlur _ ->
            ( { model | focused = False }, Cmd.none )

        OnAnimationFrame _ ->
            ( { model | countdown = Counter.update model.countdown }, Cmd.none )

        TimeNow posix ->
            let
                newCountdown =
                    let
                        -- From https://www.epochconverter.com/
                        remainingSeconds =
                            round <|
                                abs <|
                                    (toFloat (Time.posixToMillis posix) / 1000)
                                        - 1585960200
                    in
                    Counter.jumpTo remainingSeconds model.countdown
            in
            ( { model | countdown = newCountdown }
            , Cmd.none
            )

        ChangeTimeOfDay timeOfDay ->
            let
                floatingTokyoCity =
                    model.floatingTokyoCity

                newTokyoModel =
                    Playground.changeMemory floatingTokyoCity (\memory -> { memory | timeOfDay = timeOfDay })
            in
            ( { model
                | floatingTokyoCity = newTokyoModel
                , menuOpen =
                    if menuSideBySide model.width then
                        model.menuOpen

                    else
                        False
              }
                |> regenerateTheQrCode
            , Cmd.none
            )

        FloatingTokyoCityMsg tokyoMsg ->
            let
                ( floatingTokyoCity, tokyoCmd ) =
                    FloatingTokyoCity.update tokyoMsg model.floatingTokyoCity
            in
            ( { model | floatingTokyoCity = floatingTokyoCity }, Cmd.map FloatingTokyoCityMsg tokyoCmd )

        -- ( model, Cmd.none )
        ScrollTo destination ->
            ( { model
                | menuOpen =
                    if menuSideBySide model.width then
                        model.menuOpen

                    else
                        False
              }
            , scrollTo destination
            )

        OnResize x y ->
            ( { model | width = x, height = y } |> regenerateTheQrCode, Cmd.none )

        ToggleQrCode bool ->
            let
                floatingTokyoCity =
                    model.floatingTokyoCity

                newTokyoModel =
                    Playground.changeMemory floatingTokyoCity (\memory -> { memory | qrCode = bool })
            in
            ( { model
                | floatingTokyoCity = newTokyoModel
                , menuOpen = False
              }
                |> regenerateTheQrCode
            , Cmd.none
            )

        ToggleMenu ->
            ( { model | menuOpen = not model.menuOpen }, Cmd.none )

        TogglePause ->
            ( { model | pause = not model.pause }, Cmd.none )

        ChangeLanguage language ->
            ( { model
                | language = language
                , menuOpen =
                    if menuSideBySide model.width then
                        model.menuOpen

                    else
                        False
              }
            , Cmd.none
            )


paragraphAttrs : List (Attribute msg)
paragraphAttrs =
    [ spacing 12
    ]


titleSubSection : String -> Element msg
titleSubSection content =
    paragraph
        [ Font.size 22
        , Font.bold
        ]
        [ text content ]


title : Maybe Language -> Int -> Int -> String -> String -> Element msg
title maybeLanguage x marginTop en ja =
    let
        mainMargin_ =
            mainMargin x

        paddingBottom =
            0
    in
    case maybeLanguage of
        Just language ->
            paragraph
                [ width fill
                , Font.letterSpacing 4
                , paddingEach { top = marginTop, right = mainMargin_, bottom = paddingBottom, left = mainMargin_ }
                , alignTop
                , Font.center
                , Font.size 24
                ]
            <|
                case language of
                    Ja ->
                        [ text <| String.toUpper ja ]

                    En ->
                        [ text <| String.toUpper en ]

        Nothing ->
            row
                [ width fill
                , Font.size 24
                ]
                [ paragraph
                    ([ width fill
                     , height fill
                     , Font.alignRight
                     , Font.letterSpacing 4
                     , paddingEach { top = marginTop, right = mainMargin_, bottom = paddingBottom, left = mainMargin_ }
                     , alignTop
                     ]
                        ++ leftColumnAttrs
                    )
                    [ text <| String.toUpper en ]
                , paragraph
                    ([ width fill
                     , height fill
                     , Font.alignLeft
                     , paddingEach { top = marginTop, right = mainMargin_, bottom = 40, left = mainMargin_ }
                     , alignTop
                     ]
                        ++ rightColumnAttrs
                    )
                    [ text ja ]
                ]


leftColumnAttrs : List (Attr decorative msg)
leftColumnAttrs =
    []


rightColumnAttrs : List (Attr decorative msg)
rightColumnAttrs =
    []


doubleLanguageView : number -> Bool
doubleLanguageView x =
    x > 800


doubleSection :
    ( Color, String )
    -> Maybe Language
    ->
        { b
            | enContent : List (Element Msg)
            , image :
                Maybe
                    { a
                        | imageDescription : String
                        , imageHeight : Int
                        , imageSrc : String
                        , imageWidth : Int
                    }
            , jaContent : List (Element Msg)
            , width : Int
            , githubAndTwitter : Maybe ( String, String )
        }
    -> Element Msg
doubleSection fontColor_ maybeLanguage data =
    let
        imageWithBorder img =
            column
                [ Border.width 5
                , Border.rounded 20
                , Background.color <| rgba 0.5 0.5 0.5 0.5
                , Border.color <| rgba 0.5 0.5 0.5 0.3
                , centerX
                ]
                [ image
                    [ centerX
                    , width <| px img.imageWidth
                    , height <| px img.imageHeight
                    , Border.rounded 14
                    , clip
                    ]
                    { src = img.imageSrc
                    , description = img.imageDescription
                    }
                , case data.githubAndTwitter of
                    Just ( github, twitter ) ->
                        row [ padding 10, alignRight, spacing 15 ] <| githubAndTwitter (Tuple.second <| fontColor_) github twitter

                    Nothing ->
                        none
                ]

        maybeImageWithBorder image =
            case image of
                Nothing ->
                    none

                Just img ->
                    imageWithBorder img
    in
    case maybeLanguage of
        Just language ->
            case language of
                En ->
                    column [ width fill, spacing 20, padding 20 ] <| data.enContent ++ [ maybeImageWithBorder data.image ]

                Ja ->
                    column [ width fill, spacing 20, padding 20 ] <| data.jaContent ++ [ maybeImageWithBorder data.image ]

        Nothing ->
            let
                mainMargin_ =
                    mainMargin data.width

                paddingAroundImage =
                    40

                attrs =
                    [ paddingEach
                        { top = 0
                        , right = mainMargin_
                        , bottom = 0
                        , left = mainMargin_
                        }
                    , width fill
                    , height fill
                    , alignTop
                    ]

                imageAreaKeeper =
                    case data.image of
                        Nothing ->
                            []

                        Just img ->
                            [ el
                                [ width <| px <| ((img.imageWidth // 2) + paddingAroundImage) - mainMargin_
                                , height <| px <| (img.imageHeight + paddingAroundImage + 30)
                                ]
                              <|
                                none
                            ]
            in
            row
                [ width fill
                , inFront <|
                    case data.image of
                        Nothing ->
                            none

                        Just img ->
                            imageWithBorder img
                ]
                [ row
                    (attrs
                        ++ leftColumnAttrs
                    )
                  <|
                    [ column
                        [ width fill
                        , alignTop
                        , spacing 20
                        , Font.alignRight
                        ]
                        data.enContent
                    ]
                        ++ imageAreaKeeper
                , row
                    (attrs
                        ++ rightColumnAttrs
                    )
                  <|
                    imageAreaKeeper
                        ++ [ column
                                [ width fill
                                , alignTop
                                , spacing 20
                                , Font.alignLeft
                                ]
                                data.jaContent
                           ]
                ]


smallMenu : Int -> Bool
smallMenu x =
    x < 1000


largeScreen : Int -> Bool -> Bool
largeScreen x isSideMenuOpen =
    realPageWidth x isSideMenuOpen > 800


menuSideBySide : Int -> Bool
menuSideBySide x =
    x > 740


sideMenuWidth : number
sideMenuWidth =
    320


realPageWidth : Int -> Bool -> Int
realPageWidth x isSideMenuOpen =
    if menuSideBySide x then
        if isSideMenuOpen then
            x - sideMenuWidth

        else
            x

    else
        x


section : String -> Element msg
section sectionName =
    Element.el
        [ Element.paddingEach { top = 100, right = 0, bottom = 0, left = 0 }
        , Element.htmlAttribute <| Html.Attributes.id sectionName
        , width fill
        ]
        Element.none


mouseOverAttrs : List (Attribute msg)
mouseOverAttrs =
    [ mouseOver [ Background.color <| rgba 1 1 1 0.2, Border.color <| rgba 0 0 0 0 ]
    , htmlAttribute <| Html.Attributes.style "transition" "all 0.2s"
    ]


mouseOverAttrsDark : List (Attribute msg)
mouseOverAttrsDark =
    [ mouseOver [ Background.color <| rgba 0 0 0 0.1, Border.color <| rgba 0 0 0 0 ]
    , htmlAttribute <| Html.Attributes.style "transition" "all 0.2s"
    ]


menuItemAttrs : List (Attribute Msg)
menuItemAttrs =
    [ Font.letterSpacing 4
    , width fill
    , height fill
    , Font.size 16

    -- , explain Debug.todo
    ]
        ++ mouseOverAttrs


linkLabel : Bool -> String -> Icon -> String -> Element msg
linkLabel withIcon color icon_ string =
    if withIcon then
        row [ spacing 10 ] [ el [] <| icon icon_ color 18, text <| up string ]

    else
        el [ width fill, centerX ] <| text <| up string


menuList : Bool -> String -> List (Attribute Msg) -> List (Element Msg)
menuList withIcon color attrs =
    [ link (attrs ++ [ Events.onClick <| ScrollTo "#speakers" ]) { label = linkLabel withIcon color Icon_Microphone "speakers", url = "/" }
    , link (attrs ++ [ Events.onClick <| ScrollTo "#tickets" ]) { label = linkLabel withIcon color Icon_Tickets "tickets", url = "/" }
    , link (attrs ++ [ Events.onClick <| ScrollTo "#sponsors" ]) { label = linkLabel withIcon color Icon_Respect "sponsors", url = "/" }
    , link (attrs ++ [ Events.onClick <| ScrollTo "#who-we-are" ]) { label = linkLabel withIcon color Icon_HighFive "who we are", url = "/" }
    , link (attrs ++ [ Events.onClick <| ScrollTo "#top" ]) { label = linkLabel withIcon color Icon_Startup "elm conferences", url = "/elm-conferences" }
    ]


menuModes : Bool -> String -> List (Attribute Msg) -> List (Element Msg)
menuModes withIcon color attrs =
    [ Input.button attrs { label = linkLabel withIcon color Icon_Sunrise "[1] SUNRISE MODE", onPress = Just <| ChangeTimeOfDay FloatingTokyoCity.Sunrise }
    , Input.button attrs { label = linkLabel withIcon color Icon_Sun "[2] DAY MODE", onPress = Just <| ChangeTimeOfDay FloatingTokyoCity.Day }
    , Input.button attrs { label = linkLabel withIcon color Icon_Sunset "[3] SUNSET MODE", onPress = Just <| ChangeTimeOfDay FloatingTokyoCity.Sunset }
    , Input.button attrs { label = linkLabel withIcon color Icon_Moon "[4] NIGHT MODE", onPress = Just <| ChangeTimeOfDay FloatingTokyoCity.Night }
    , link attrs { label = linkLabel withIcon color Icon_QRCodeSmall "[Q] QR CODE", url = "/qr-code" }
    ]


menuContacts : Bool -> String -> List (Attribute msg) -> List (Element msg)
menuContacts withIcon color attrs =
    [ newTabLink attrs { label = linkLabel withIcon color Icon_PaperPlane "Mailing list", url = linkMailingList }
    , newTabLink attrs { label = linkLabel withIcon color Icon_TwitterOutlined handleTwitter, url = linkTwitter }
    , newTabLink attrs { label = linkLabel withIcon color Icon_Email emailSponsors, url = "mailto:" ++ emailSponsors }
    , newTabLink attrs { label = linkLabel withIcon color Icon_WaveHand emailHello, url = "mailto:" ++ emailHello }
    ]


logoButton : Int -> Element Msg
logoButton x =
    Input.button
        [ width fill ]
        { label =
            row
                [ spacing 16
                ]
                ([ el [] <| icon Icon_Logo "" 50
                 ]
                    ++ (if x < 420 then
                            [ column
                                [ spacing 5
                                , Font.size 14
                                ]
                                [ el [ Font.color <| rgb 0.5 0.5 0.5 ] <| text "elm"
                                , el [ moveUp 1 ] <| text "japan"
                                , el [ Font.color <| rgb 0.5 0.5 0.5 ] <| text "2020"
                                ]
                            ]

                        else
                            [ row
                                [ spacing 10
                                , Font.size 24
                                ]
                                [ el [ Font.color <| rgb 0.5 0.5 0.5 ] <| text "elm"
                                , el [] <| text "japan"
                                , el [ Font.color <| rgb 0.5 0.5 0.5 ] <| text "2020"
                                ]
                            ]
                       )
                )
        , onPress = Just <| ScrollTo "#top"
        }


languageToString : Language -> String
languageToString language =
    case language of
        Ja ->
            "JA"

        En ->
            "EN"


menuIcon : Int -> Language -> Element Msg
menuIcon x language =
    row [ spacing 15 ]
        ((if doubleLanguageView x then
            []

          else
            [ if language == En then
                text <| languageToString En

              else
                Input.button
                    [ Font.bold
                    , Border.widthEach
                        { bottom = 1, left = 0, right = 0, top = 0 }
                    ]
                    { label = text <| languageToString En, onPress = Just <| ChangeLanguage En }
            , if language == Ja then
                text <| languageToString Ja

              else
                Input.button
                    [ Font.bold
                    , Border.widthEach
                        { bottom = 1, left = 0, right = 0, top = 0 }
                    ]
                    { label = text <| languageToString Ja, onPress = Just <| ChangeLanguage Ja }
            ]
         )
            ++ [ Input.button [ moveUp 2, Font.size 40, paddingEach { top = 0, right = 0, bottom = 0, left = 10 } ] { label = text "☰", onPress = Just ToggleMenu } ]
        )


viewHeader : Language -> Int -> Element Msg
viewHeader language x =
    row
        [ width fill
        , Font.center
        , Background.color <| rgb255 0 0 0
        , Font.color <| rgb255 200 200 200
        , alpha 0.8
        , height <| px headerHeight
        , paddingXY (headerHeight // 4) 0
        ]
        ([ logoButton x ]
            ++ (if smallMenu x then
                    [ menuIcon x language ]

                else
                    List.take 4 (menuList False "white" menuItemAttrs) ++ [ menuIcon x language ]
               )
        )


fontColor : FloatingTokyoCity.TimeOfDay -> ( Color, String )
fontColor timeOfDay =
    case timeOfDay of
        FloatingTokyoCity.Sunrise ->
            ( rgba255 255 255 255 0.8, "rgba(255, 255, 255, 0.8)" )

        FloatingTokyoCity.Day ->
            ( rgba255 0 0 0 0.8, "rgba(0, 0, 0, 0.8)" )

        FloatingTokyoCity.Sunset ->
            ( rgba255 0 0 0 0.8, "rgba(0, 0, 0, 0.8)" )

        FloatingTokyoCity.Night ->
            ( rgba255 255 255 255 0.45, "rgba(255, 255, 255, 0.45)" )


linkAttrs : List (Attribute msg)
linkAttrs =
    [ Border.widthEach { bottom = 1, left = 0, right = 0, top = 0 }
    , Background.color <| rgba 1 1 1 0.1
    , mouseOver [ Background.color <| rgba 1 1 1 0.3, Border.color <| rgba 0 0 0 0 ]
    , htmlAttribute <| Html.Attributes.style "transition" "all 0.2s"
    , paddingXY 3 0
    ]


githubAndTwitter : String -> String -> String -> List (Element Msg)
githubAndTwitter fontColor_ github twitter =
    [ newTabLink [] { label = icon Icon_Github fontColor_ 26, url = "https://github.com/" ++ github }
    , newTabLink [] { label = icon Icon_Twitter fontColor_ 26, url = "https://twitter.com/" ++ twitter }
    ]


viewQrCode : Model -> Html.Html Msg
viewQrCode model =
    let
        newTokyoModel =
            Playground.changeMemory model.floatingTokyoCity (\memory -> { memory | timeOfDay = FloatingTokyoCity.Night })

        tokyoView =
            FloatingTokyoCity.view newTokyoModel

        timeOfDay =
            FloatingTokyoCity.Day

        fontColorAsString =
            Tuple.second <| fontColor timeOfDay

        fontColorAsColor =
            Tuple.first <| fontColor timeOfDay

        fontSize =
            floatingCityWidth // 5

        floatingCityWidth =
            if model.width < 650 then
                max (model.width - 400) 120

            else
                250
    in
    layoutWith
        { options =
            [ focusStyle
                { borderColor = Nothing
                , backgroundColor = Nothing
                , shadow = Nothing
                }
            ]
        }
        [ -- Here we need to pass an empty list of Font Family
          -- otherwise elm-ui add its own font families
          Font.family []
        , Font.color fontColorAsColor
        , Font.size fontSize
        , Background.color <| rgb255 41 190 210
        , inFront <|
            link
                [ alignRight
                , padding 25
                , Events.onClick <| ToggleQrCode False
                ]
            <|
                { label = icon Icon_Close fontColorAsString 30
                , url = "/"
                }
        ]
    <|
        column
            [ centerX
            , centerY
            , spacing 20
            , padding 20
            ]
            [ el
                [ inFront <|
                    el
                        [ clip
                        , centerX
                        , centerY
                        , width <| px floatingCityWidth
                        ]
                    <|
                        html <|
                            Html.map FloatingTokyoCityMsg <|
                                Html.div [] tokyoView.body
                ]
              <|
                model.cachedQrCodeBlack
            , el
                [ centerX
                , Font.size <|
                    if model.width > 600 then
                        60

                    else if model.width > 450 then
                        40

                    else
                        14
                , htmlAttribute <| Html.Attributes.style "letter-spacing" "13px"
                ]
              <|
                text "elmjapan.org"
            ]


sideMenu : { a | language : Language, menuOpen : Bool, width : Int } -> Element Msg
sideMenu model =
    el
        [ Background.color <| rgba 1 1 1 1
        , Font.color <| rgb 0.1 0.1 0.1
        , width <| px sideMenuWidth
        , alignRight
        , height fill
        , paddingEach { top = 20, right = 0, bottom = 60, left = 0 }
        , htmlAttribute <| Html.Attributes.style "transition" "all 0.2s"
        , scrollbarY
        , moveRight <|
            if model.menuOpen then
                0

            else
                sideMenuWidth
        ]
    <|
        let
            attrs =
                [ Font.letterSpacing 2
                , width fill
                , height fill
                , Font.size 14
                , paddingXY 40 15
                ]
                    ++ mouseOverAttrsDark
        in
        column [ spacing 30, width fill ]
            [ el [ alignRight, moveLeft 20 ] <| menuIcon model.width model.language
            , el ([ paddingXY 40 15, width fill ] ++ mouseOverAttrsDark) (logoButton 1000)
            , column [ width fill ] <| menuList True "black" attrs
            , column [ width fill ] <| menuContacts True "black" attrs
            , column [ width fill ] <| menuModes True "black" attrs
            ]


topBody :
    { a | language : Language, menuOpen : Bool, width : Int }
    -> FloatingTokyoCity.TimeOfDay
    -> Element Msg
topBody model timeOfDay =
    let
        maybeLanguage =
            if largeScreen model.width model.menuOpen then
                Nothing

            else
                Just model.language
    in
    column
        [ width (fill |> maximum 1200)
        , centerX
        , paddingEach { top = 80, right = 0, bottom = 0, left = 0 }
        ]
        [ title maybeLanguage model.width 0 "Saturday April 4, 2020" "2020年4月4日(土)"
        , doubleSection
            (fontColor timeOfDay)
            maybeLanguage
            { width = model.width
            , image = Nothing
            , enContent =
                [ paragraph paragraphAttrs [ text "The first Elm conference in the Asia-Pacific region!" ]
                , paragraph paragraphAttrs [ text "It will be a single-day conference in English and Japanese that will take place in Tokyo." ]
                , paragraph paragraphAttrs [ text "If you're interested in Elm, functional programming, or frontend development in general and want to meet interesting people, join us!" ]
                ]
            , jaContent =
                [ paragraph paragraphAttrs [ text "アジア太平洋地域で初のElmカンファレンス！" ]
                , paragraph paragraphAttrs [ text "東京で一日のみ、英語及び日本語でのカンファレンスになります。" ]
                , paragraph paragraphAttrs [ text "Elm、関数型プログラミング、フロントエンド開発全般に興味がある方、交流を深めたい方は是非ご参加下さい。" ]
                ]
            , githubAndTwitter = Nothing
            }
        , section "speakers"
        , title maybeLanguage model.width marginAboveTitles "Speakers" "スピーカー"
        , column [ spacing 20 ]
            [ doubleSection
                (fontColor timeOfDay)
                maybeLanguage
                { width = model.width
                , image =
                    Just
                        { imageDescription = "Evan Czaplicki"
                        , imageSrc = "images/speakers/evan_czaplicki.jpg"
                        , imageWidth = 245
                        , imageHeight = 300
                        }
                , enContent =
                    [ titleSubSection "Evan Czaplicki"
                    , paragraph paragraphAttrs [ text "Evan created Elm. He is an open source engineer at NoRedInk, where the front-end code includes more than 300k lines of Elm. He works on Elm full-time, developing the compiler, language, tools, and libraries." ]
                    ]
                , jaContent =
                    [ titleSubSection "エヴァン・チャプリキ"
                    , paragraph paragraphAttrs [ text "EvanはElmの作者。フルタイムのオープンソースエンジニアとして、コンパイラーや言語、ツール、ライブラリなどElmに関する仕事をしている。彼が所属するNoRedInkにはフロントエンドのコードに30万行を超えるElmコードが含まれる。" ]
                    ]
                , githubAndTwitter = Just ( "evancz", "czaplic" )
                }
            , doubleSection
                (fontColor timeOfDay)
                maybeLanguage
                { width = model.width
                , image =
                    Just
                        { imageDescription = "Andrey Kuzmin"
                        , imageSrc = "images/speakers/andrey_kuzmin.jpg"
                        , imageWidth = 245
                        , imageHeight = 245
                        }
                , enContent =
                    [ titleSubSection "Andrey Kuzmin"
                    , paragraph paragraphAttrs [ text "Andrey is an engineer at SoundCloud. He is the maintainer of WebGL in Elm and an organizer of the Elm Berlin meetup. Apart from work, he enjoys live music in Berlin and is a yoga newbie." ]
                    ]
                , jaContent =
                    [ titleSubSection "アンドレイ・クズミン"
                    , paragraph paragraphAttrs [ text "AndreyはSoundCloudのエンジニア。 Elm製WebGLライブラリのメンテナーであり、Elm Berlin Meetupの主催者。 仕事以外では、ベルリンでライブ音楽を楽しんでおり、ヨガの初心者。" ]
                    ]
                , githubAndTwitter = Just ( "w0rm", "unsoundscapes" )
                }
            , doubleSection
                (fontColor timeOfDay)
                maybeLanguage
                { width = model.width
                , image =
                    Just
                        { imageDescription = "Matthew Griffith"
                        , imageSrc = "images/speakers/matthew_griffith.jpeg"
                        , imageWidth = 245
                        , imageHeight = 245
                        }
                , enContent =
                    [ titleSubSection "Matthew Griffith"
                    , paragraph paragraphAttrs [ text "Matt is the author of Elm UI, Elm Markup, and Elm Style Animation packages. He currently works at Blissfully and organizes the Elm New York meetup." ]
                    ]
                , jaContent =
                    [ titleSubSection "マシュー・グリフィス"
                    , paragraph paragraphAttrs [ text "MattはElm UI、Elm Markup、およびElm Style Animationパッケージの作者。 現在Blissfullyで働いており、Elm New York meetup の主催者。" ]
                    ]
                , githubAndTwitter = Just ( "mdgriffith", "mech_elephant" )
                }
            , doubleSection
                (fontColor timeOfDay)
                maybeLanguage
                { width = model.width
                , image =
                    Nothing
                , enContent =
                    [ titleSubSection "You?"
                    , paragraph paragraphAttrs
                        [ text "Would you like to speak at "
                        , el [ Font.extraBold ] <| text "Elm Japan 2020"
                        , text "? We will open a call for speakers soon. "
                        , newTabLink linkAttrs { url = linkMailingList, label = text "Subscribe to our mailing list" }
                        , text " or "
                        , newTabLink linkAttrs { url = linkTwitter, label = text followUsOnTwitter }
                        , text " to be notified."
                        ]
                    , paragraph paragraphAttrs [ text "We invite speakers of all levels to submit 20-minute talk proposals and we encourage first-time speakers to apply!" ]
                    ]
                , jaContent =
                    [ titleSubSection "あなたも登壇しませんか？"
                    , paragraph paragraphAttrs
                        [ text "Elm Japan 2020 に登壇しませんか？ 間もなく登壇者の募集を開始いたします。"
                        , newTabLink linkAttrs { url = linkMailingList, label = text "メーリングリストに登録する" }
                        , text "か、"
                        , newTabLink linkAttrs { url = linkTwitter, label = text "Twitterアカウント @elmjapanconf をフォロー" }
                        , text "して最新の情報をご確認ください。"
                        ]
                    , paragraph paragraphAttrs
                        [ text "登壇を希望される方には、20分間の発表を想定したプロポーザルをご提出いただきます。あらゆるレベルの方にご登壇いただけますので、特にこのようなカンファレンスで初登壇の方も歓迎いたします！"
                        ]
                    ]
                , githubAndTwitter = Nothing
                }
            ]
        , section "tickets"
        , title maybeLanguage model.width marginAboveTitles "Tickets" "チケット"
        , doubleSection
            (fontColor timeOfDay)
            maybeLanguage
            { width = model.width
            , image = Nothing
            , enContent =
                [ paragraph paragraphAttrs
                    [ text "Tickets will be available soon. "
                    , newTabLink linkAttrs { url = linkMailingList, label = text "Subscribe to our mailing list" }
                    , text " or "
                    , newTabLink linkAttrs { url = linkTwitter, label = text followUsOnTwitter }
                    , text " to be notified when they are ready."
                    ]
                ]
            , jaContent =
                [ paragraph paragraphAttrs
                    [ text "チケットの受付は間もなく開始いたします。"
                    , newTabLink linkAttrs { url = linkMailingList, label = text "メーリングリストに登録する" }
                    , text "か、"
                    , newTabLink linkAttrs { url = linkTwitter, label = text "Twitterアカウント @elmjapanconf をフォロー" }
                    , text "して最新の情報をご確認ください。"
                    ]
                ]
            , githubAndTwitter = Nothing
            }
        , section "sponsors"
        , title maybeLanguage model.width marginAboveTitles "Sponsors" "スポンサー"
        , doubleSection
            (fontColor timeOfDay)
            maybeLanguage
            { width = model.width
            , image = Nothing
            , enContent =
                [ paragraph paragraphAttrs
                    [ el [ Font.bold ] <| text "Elm Japan 2020"
                    , text " sponsorships are available at a variety of levels. Request the sponsorship prospectus by sending an email to "
                    , newTabLink linkAttrs { url = "mailto:" ++ emailSponsors, label = text <| emailSponsors }
                    , text "."
                    ]
                ]
            , jaContent =
                [ paragraph paragraphAttrs
                    [ text "Elm Japan 2020 は大小あらゆる形でスポンサーを募集いたします。スポンサーをご希望の方は"
                    , newTabLink linkAttrs { url = "mailto:" ++ emailSponsors, label = text <| emailSponsors }
                    , text "に目論見書をご送付ください。"
                    ]
                ]
            , githubAndTwitter = Nothing
            }
        , section "who-we-are"
        , title maybeLanguage model.width marginAboveTitles "Who we are" "運営団体"
        , doubleSection
            (fontColor timeOfDay)
            maybeLanguage
            { width = model.width
            , image = Nothing
            , enContent = [ paragraph paragraphAttrs [ text "The conference is non-profit and community-driven, organized by enthusiastic members of the Japanese Elm community." ] ]
            , jaContent = [ paragraph paragraphAttrs [ text "本カンファレンスは日本のElmコミュニティの有志によって非営利で運営されています。" ] ]
            , githubAndTwitter = Nothing
            }
        , title maybeLanguage model.width marginAboveTitles "" ""
        ]


viewDocument : Model -> Browser.Document Msg
viewDocument model =
    { title = "Elm Japan 2020"
    , body = [ view model ]
    }


view : Model -> Html.Html Msg
view model =
    let
        tokyoView =
            FloatingTokyoCity.view model.floatingTokyoCity

        memoryFloatingTokyoCity =
            Playground.getMemory model.floatingTokyoCity

        timeOfDay =
            memoryFloatingTokyoCity.timeOfDay

        qrCode =
            memoryFloatingTokyoCity.qrCode

        colors =
            FloatingTokyoCity.palette timeOfDay

        ( r, g, b ) =
            .backgroundRgb colors
    in
    if model.url.path == "/qr-code" || qrCode then
        viewQrCode model

    else
        layoutWith
            { options =
                [ focusStyle
                    { borderColor = Nothing
                    , backgroundColor = Nothing
                    , shadow = Nothing
                    }
                ]
            }
            ([ -- Here we need to pass an empty list of Font Family
               -- otherwise elm-ui add its own font families
               Font.family []
             , Font.color <| Tuple.first <| fontColor memoryFloatingTokyoCity.timeOfDay
             , Font.size 18
             , Background.color <| rgb255 (round r) (round g) (round b)
             , htmlAttribute <| Html.Attributes.style "transition" "all 0.5s"
             , inFront <|
                viewHeader model.language model.width
             ]
                ++ (if String.contains "without-debugger" model.href then
                        []

                    else if smallMenu model.width then
                        []

                    else
                        [ inFront <|
                            el
                                [ alignBottom
                                , alignRight
                                , moveUp 110
                                , moveRight 45
                                , rotate 1.7
                                ]
                            <|
                                icon Icon_LookInside (Tuple.second <| fontColor memoryFloatingTokyoCity.timeOfDay) 200
                        ]
                   )
                -- SIDE MENU
                ++ [ inFront <|
                        sideMenu
                            { language = model.language
                            , menuOpen = model.menuOpen
                            , width = model.width
                            }
                   ]
            )
        <|
            column
                [ width fill
                , paddingEach
                    { top = 0
                    , right =
                        if menuSideBySide model.width then
                            if model.menuOpen then
                                sideMenuWidth

                            else
                                0

                        else
                            0
                    , bottom = 0
                    , left = 0
                    }
                , htmlAttribute <| Html.Attributes.style "transition" "all 0.2s"
                ]
            <|
                if model.url.path == "/elm-conferences" || qrCode then
                    [ section "top"
                    , pageConferences model
                    , footer model
                    ]

                else
                    [ section "top"
                    , paragraph
                        [ Font.center
                        , alpha 0.2
                        , Font.size
                          {-
                             1000 -> 120
                             320 -> 40

                             y = (2/17) * x + (40/17)

                             1000 -> 90
                             320 -> 50

                             y = (1/17) * x + (530/17)
                          -}
                          <|
                            min 120
                                (round <|
                                    (2 / 17)
                                        * toFloat model.width
                                        + (40 / 17)
                                )
                        , Font.extraBold
                        , moveDown <|
                            min 90
                                ((1 / 17)
                                    * toFloat model.width
                                    + (530 / 17)
                                )
                        ]
                        [ text "elm japan 2020" ]
                    , let
                        counterWithButton =
                            row
                                [ spacing 10 ]
                                ([ el [] <|
                                    icon
                                        (if model.pause then
                                            Icon_Play

                                         else
                                            Icon_Pause
                                        )
                                        (Tuple.second <| fontColor memoryFloatingTokyoCity.timeOfDay)
                                        25
                                 ]
                                    ++ (if model.startedOnSmallDevice then
                                            []

                                        else
                                            [ row [] [ text "- ", Counter.View.view model.countdown 20 ] ]
                                       )
                                )
                      in
                      el
                        [ centerX
                        , height (fill |> maximum (round <| ((400 / 600) * toFloat model.width)))
                        , width (fill |> maximum 600)
                        , inFront <|
                            Input.button
                                [ alpha 0.5
                                , alignBottom
                                , alignRight
                                , moveLeft 35
                                , moveUp 40
                                , Border.rounded 20
                                , paddingEach { top = 3, right = 5, bottom = 3, left = 5 }
                                , Background.color <|
                                    case timeOfDay of
                                        FloatingTokyoCity.Sunrise ->
                                            rgba 0 0 0.1 0.4

                                        FloatingTokyoCity.Day ->
                                            rgba 1 1 1 0.4

                                        FloatingTokyoCity.Sunset ->
                                            rgba 1 1 1 0.4

                                        FloatingTokyoCity.Night ->
                                            rgba 0 0 0 0.6
                                ]
                            <|
                                { label = counterWithButton
                                , onPress = Just TogglePause
                                }
                        ]
                      <|
                        html <|
                            Html.map FloatingTokyoCityMsg <|
                                Html.div [] tokyoView.body
                    , topBody
                        { language = model.language, menuOpen = model.menuOpen, width = model.width }
                        memoryFloatingTokyoCity.timeOfDay
                    , footer
                        { href = "model.href"
                        , menuOpen = model.menuOpen
                        , startedOnSmallDevice = model.startedOnSmallDevice
                        , width = model.width
                        }
                    ]


pageConferences :
    { b
        | floatingTokyoCity : Playground.Game { a | timeOfDay : FloatingTokyoCity.TimeOfDay }
    }
    -> Element msg
pageConferences model =
    let
        memoryFloatingTokyoCity =
            Playground.getMemory model.floatingTokyoCity

        fontColorString =
            Tuple.second <| fontColor memoryFloatingTokyoCity.timeOfDay

        confs =
            [ { name = "Elm Conf"
              , twitter = "elmconf"
              , website = "https://2019.elm-conf.com/"
              , logo = "/elm-japan/conference-logos/elm-conf.png"
              , city = "St. Louis"
              , country = "Missouri, US"
              , editions =
                    -- Elm Conf	2016	St. Louis	US	15-Sep-2016	https://2016.elm-conf.us/	11	"Code is the Easy part"	https://www.youtube.com/playlist?list=PLglJM3BYAMPH2zuz1nbKHQyeawE4SN0Cd	N/A	https://twitter.com/elmconf	1 day
                    -- Elm Conf	2017	St. Louis	US	28-Sep-2017	https://2017.elm-conf.us/	10	NOT RELEASED	https://www.youtube.com/playlist?list=PLglJM3BYAMPFTT61A0Axo_8n0s9n9CixA	N/A	https://twitter.com/elmconf	1 day
                    -- Elm Conf	2018	St. Louis	US	26-Sep-2018	https://2018.elm-conf.us/	9	NOT ATTENDED	https://www.youtube.com/playlist?list=PLglJM3BYAMPHuB7zrYkH2Kin2vQOkr2xW	N/A	https://twitter.com/elmconf	1 day
                    -- Elm Conf	2019	St. Louis	US	12-Sep-2019	https://2019.elm-conf.com/	10	NOT ATTENDED	https://www.youtube.com/playlist?list=PLglJM3BYAMPGsAM4QTka7FwJ0xLPS0mkN	~150	https://twitter.com/elmconf	1 day
                    [ { year = 2016
                      , date = "Sept. 15"
                      , website = "https://2016.elm-conf.us/"
                      , videos = "https://www.youtube.com/playlist?list=PLglJM3BYAMPH2zuz1nbKHQyeawE4SN0Cd"
                      }
                    , { year = 2017
                      , date = "Sept. 28"
                      , website = "https://2017.elm-conf.us/"
                      , videos = "https://www.youtube.com/playlist?list=PLglJM3BYAMPFTT61A0Axo_8n0s9n9CixA"
                      }
                    , { year = 2018
                      , date = "Sept. 26"
                      , website = "https://2018.elm-conf.us/"
                      , videos = "https://www.youtube.com/playlist?list=PLglJM3BYAMPHuB7zrYkH2Kin2vQOkr2xW"
                      }
                    , { year = 2019
                      , date = "Sept. 12"
                      , website = "https://2019.elm-conf.com/"
                      , videos = "https://www.youtube.com/playlist?list=PLglJM3BYAMPGsAM4QTka7FwJ0xLPS0mkN"
                      }
                    ]
              }
            , { name = "Elm Europe"
              , twitter = "elm_europe"
              , website = "https://2019.elmeurope.org/"
              , logo = "/elm-japan/conference-logos/elm-europe.jpg"
              , city = "Paris"
              , country = "France"
              , editions =
                    -- Elm Europe	2017	Paris	France	8-Jun-2017	https://2017.elmeurope.org/	22	"The life of a file"	https://www.youtube.com/watch?v=XpDsk374LDE&list=PL-cYi7I913S8cGyZWdN6YVZ028iS9BfpM	~140	https://twitter.com/elm_europe	2 days
                    -- Elm Europe	2018	Paris	France	5-Jul-2018	https://2018.elmeurope.org/	21	"What is success?"	https://www.youtube.com/watch?v=uGlzRt-FYto&list=PL-cYi7I913S-VgTSUKWhrUkReM_vMNQxG	N/A	https://twitter.com/elm_europe	2 days
                    -- Elm Europe	2019	Paris	France	27-Jun-2019	https://2019.elmeurope.org/	23	NOT ATTENDED	NOT RELEASED YET	~130	https://twitter.com/elm_europe	2 days
                    [ { year = 2017
                      , date = "June 8-9"
                      , website = "https://2017.elmeurope.org/"
                      , videos = "https://www.youtube.com/playlist?list=PL-cYi7I913S8cGyZWdN6YVZ028iS9BfpM"
                      }
                    , { year = 2018
                      , date = "July 5-6"
                      , website = "https://2018.elmeurope.org/"
                      , videos = "https://www.youtube.com/playlist?list=PL-cYi7I913S-VgTSUKWhrUkReM_vMNQxG"
                      }
                    , { year = 2019
                      , date = "June 27-28"
                      , website = "https://2019.elmeurope.org/"
                      , videos = "https://www.youtube.com/playlist?list=PL-cYi7I913S_oRLJEpsVbSTq_OOMSXlPD"
                      }
                    ]
              }
            , { name = "Oslo Elm Day"
              , twitter = "osloelmday"
              , website = "https://osloelmday.no/"
              , logo = "/elm-japan/conference-logos/oslo-elm-day.jpg"
              , city = "Oslo"
              , country = "Norway"
              , editions =
                    -- Oslo Elm Day	2017	Oslo	Norway	10-Jun-2017	https://2017.osloelmday.no/	10	NOT ATTENDED	https://www.youtube.com/watch?v=NKl0dtSe8rs&list=PLcAzxXzXQlPZsNcYycHittqeF3UG4dGli	N/A	https://twitter.com/osloelmday	1 day
                    -- Oslo Elm Day	2019	Oslo	Norway	16-Feb-2019	https://osloelmday.no/	18	NOT ATTENDED	https://www.youtube.com/watch?v=RN2_NchjrJQ&list=PLcAzxXzXQlPbalOfueVbHCRSo26ksIXiF	~160	https://twitter.com/osloelmday	1 day/double track
                    [ { year = 2017
                      , date = "June 10"
                      , website = "https://2017.osloelmday.no/"
                      , videos = "https://www.youtube.com/playlist?list=PLcAzxXzXQlPZsNcYycHittqeF3UG4dGli"
                      }
                    , { year = 2019
                      , date = "February 16"
                      , website = "https://2019.osloelmday.no/"
                      , videos = "https://www.youtube.com/playlist?list=PLcAzxXzXQlPbalOfueVbHCRSo26ksIXiF"
                      }
                    ]
              }
            , { name = "Elm in the Spring"
              , twitter = "ElmInTheSpring"
              , website = "https://elminthespring.org/"
              , logo = "/elm-japan/conference-logos/elm-in-the-spring.jpg"
              , city = "Chicago"
              , country = "Illinois, US"
              , editions =
                    -- Elm in the Spring	2019	Chicago	US	26-Apr-2019	https://www.elminthespring.org/	10	NOT ATTENDED	https://www.youtube.com/channel/UC_wKoNegfKbmVIPg7YYKLWQ/videos	~70	https://twitter.com/ElmInTheSpring	1 day
                    [ { year = 2019
                      , date = "April 26"
                      , website = "https://2019.elminthespring.org/"
                      , videos = "https://www.youtube.com/channel/UC_wKoNegfKbmVIPg7YYKLWQ/videos"
                      }
                    , { year = 2020
                      , date = "May 1"
                      , website = "https://elminthespring.org/"
                      , videos = ""
                      }
                    ]
              }
            , { name = "Elm Japan"
              , twitter = "ElmJapanConf"
              , website = "https://elmjapan.org/"
              , logo = "/elm-japan/conference-logos/elm-japan.png"
              , city = "Tokyo"
              , country = "Japan"
              , editions =
                    -- Elm in the Spring	2019	Chicago	US	26-Apr-2019	https://www.elminthespring.org/	10	NOT ATTENDED	https://www.youtube.com/channel/UC_wKoNegfKbmVIPg7YYKLWQ/videos	~70	https://twitter.com/ElmInTheSpring	1 day
                    [ { year = 2020
                      , date = "April 4"
                      , website = "https://elmjapan.org/"
                      , videos = ""
                      }
                    ]
              }
            ]
    in
    column
        [ padding 40
        , spacing 50
        , centerX

        -- , explain Debug.todo
        -- , width <| px 700
        ]
        [ el (pageTitleAttrs ++ [ centerX ]) <| text "Elm Conferences"
        , wrappedRow
            [ centerX
            , Font.center
            , spacing 20
            ]
          <|
            List.map
                (\conf ->
                    column
                        [ spacing 40
                        , alignTop
                        , width fill
                        , height fill

                        --
                        , width
                            (fill
                                |> minimum 200
                            )
                        , Background.color <| rgba 1 1 1 0.2
                        , Border.rounded 20
                        , padding 20
                        ]
                        [ column
                            [ spacing 10
                            , centerX

                            -- , width <| fillPortion 1
                            -- , explain Debug.todo
                            ]
                            [ el [ centerX, Font.size 35 ] <| text conf.city
                            , el [ centerX, Font.size 20 ] <| text conf.country
                            , el [ centerX, Font.size 20 ] <| text conf.name
                            , newTabLink [ centerX ] { label = icon Icon_TwitterOutlined fontColorString 20, url = "https://twitter.com/" ++ conf.twitter }
                            ]
                        , newTabLink [ centerX ]
                            { label =
                                image
                                    [ clip
                                    , Border.rounded 100
                                    , width <| px 150

                                    -- , explain Debug.todo
                                    ]
                                    { src = conf.logo, description = conf.name }
                            , url = conf.website
                            }
                        , column
                            [ spacing 10
                            , centerX
                            , height fill

                            -- , explain Debug.todo
                            -- , padding 10
                            ]
                          <|
                            List.map
                                (\edition ->
                                    -- [ { year = 2016
                                    --   , website = "https://2016.elm-conf.us/"
                                    --   , videos = "https://www.youtube.com/watch?v=DSjbTC-hvqQ&list=PLglJM3BYAMPH2zuz1nbKHQyeawE4SN0Cd"
                                    --   }
                                    row
                                        [ spacing 10
                                        ]
                                        [ if String.isEmpty edition.videos then
                                            el [ alpha 0.2 ] <| icon Icon_VideosOutline fontColorString 24

                                          else
                                            newTabLink [] { label = icon Icon_VideosOutline fontColorString 24, url = edition.videos }
                                        , newTabLink linkAttrs { label = text <| edition.date ++ ", " ++ String.fromInt edition.year, url = edition.website }
                                        ]
                                )
                                conf.editions
                        ]
                )
                confs
        ]


pageTitleAttrs : List (Attr decorative msg)
pageTitleAttrs =
    [ Font.size 30 ]


up : String -> String
up =
    String.toUpper


linkAttrsFooter : List (Attr () msg)
linkAttrsFooter =
    [ Font.color <| rgb 1 1 1
    , Border.widthEach { bottom = 1, left = 0, right = 0, top = 0 }
    , Border.color <| rgba 1 1 1 0.6
    ]
        ++ mouseOverAttrs


footer :
    { a | href : String, menuOpen : Bool, startedOnSmallDevice : Bool, width : Int }
    -> Element Msg
footer model =
    let
        attrs =
            [ width fill
            , paddingXY 40 10
            ]
                ++ mouseOverAttrs

        colsAttrs =
            [ alignBottom
            , width fill
            ]

        col1 =
            column colsAttrs (menuContacts True "white" attrs)

        col3 =
            column colsAttrs (menuModes True "white" attrs)

        col2 =
            column colsAttrs (menuList True "white" attrs)

        -- このサイトはelmとelm-uiで作られています
        -- トップの「空中都市」はelm-playgroud および elm-playground-3d で作成しています
        madeAndCopy =
            [ paragraph
                []
                [ text "This site is made with "
                , newTabLink linkAttrsFooter { label = text "elm", url = "https://elm-lang.org/" }
                , text " and "
                , newTabLink linkAttrsFooter { label = text "elm-ui", url = "https://package.elm-lang.org/packages/mdgriffith/elm-ui/latest/" }
                ]
            , paragraph []
                [ text "The \"floating city\" is made with "
                , newTabLink linkAttrsFooter { label = text "elm-playground", url = "https://package.elm-lang.org/packages/evancz/elm-playground/latest/Playground" }
                , text " and "
                , newTabLink linkAttrsFooter { label = text "elm-playground-3d", url = "https://github.com/lucamug/elm-playground-3d" }
                ]
            ]
                ++ (if model.startedOnSmallDevice then
                        []

                    else if String.contains "without-debugger" model.href then
                        [ paragraph
                            []
                            [ text "Version "
                            , link linkAttrsFooter { label = text "with the Elm Debugger", url = "?" }
                            ]
                        ]

                    else
                        [ paragraph
                            []
                            [ text "Version "
                            , link linkAttrsFooter { label = text "without the Elm Debugger", url = "?without-debugger" }
                            ]
                        ]
                   )
                ++ [ paragraph [ moveDown 30 ] [ text "© Elm Japan 2020" ] ]
    in
    el
        [ Background.image "images/back7.jpg"
        , htmlAttribute <| Html.Attributes.style "background-position-y" "top"
        , width fill
        , Font.size 14
        , Font.color <| rgba 1 1 1 0.8
        , paddingEach { top = 220, right = 20, bottom = 80, left = 20 }
        , Font.letterSpacing 2
        ]
    <|
        if not (largeScreen model.width model.menuOpen) then
            column
                [ Font.center
                , spacing 40
                , centerX
                ]
                [ column
                    [ centerX
                    , spacing 40
                    ]
                    [ col1
                    , col2
                    , col3
                    ]
                , column
                    [ width fill
                    , spacing 20
                    , Font.letterSpacing 1
                    , Font.size 15
                    ]
                    madeAndCopy
                ]

        else
            column
                [ centerX
                , spacing 40
                ]
                [ row
                    [ width (fill |> maximum 800)
                    , centerX
                    ]
                    [ col1, col2, col3 ]
                , column [ centerX, spacing 10, Font.center ] madeAndCopy
                ]


main : Program Flags Model Msg
main =
    Browser.application
        { init = init
        , view = viewDocument
        , update = update
        , subscriptions = subscriptions
        , onUrlRequest = OnUrlRequest
        , onUrlChange = OnUrlChange
        }


subscriptions :
    { b
        | countdown : Counter.Counter
        , floatingTokyoCity : Playground.Game FloatingTokyoCity.Model
        , focused : Bool
        , pause : Bool
        , startedOnSmallDevice : Bool
        , url : { a | path : String }
    }
    -> Sub Msg
subscriptions model =
    if model.url.path == "/elm-conferences" then
        Browser.Events.onResize OnResize

    else
        Sub.batch
            ([ Browser.Events.onResize OnResize
             , onblur OnBlur
             , onfocus OnFocus
             ]
                ++ (if model.focused && not model.pause then
                        [ Sub.map FloatingTokyoCityMsg <| FloatingTokyoCity.subscriptions model.floatingTokyoCity ]
                            ++ (if model.startedOnSmallDevice then
                                    []

                                else
                                    []
                                -- [ Time.every 1000 TimeNow ]
                                --     ++ (if Counter.areMoving [ model.countdown ] then
                                --             [ Browser.Events.onAnimationFrame OnAnimationFrame ]
                                --
                                --         else
                                --             []
                                --        )
                               )

                    else
                        []
                   )
            )



{-
   ███████ ██    ██  ██████      ██  ██████  ██████  ███    ██ ███████
   ██      ██    ██ ██           ██ ██      ██    ██ ████   ██ ██
   ███████ ██    ██ ██   ███     ██ ██      ██    ██ ██ ██  ██ ███████
        ██  ██  ██  ██    ██     ██ ██      ██    ██ ██  ██ ██      ██
   ███████   ████    ██████      ██  ██████  ██████  ██   ████ ███████
   SVG ICONS
-}


type Icon
    = Icon_Github
    | Icon_Twitter
    | Icon_LookInside
    | Icon_Play
    | Icon_Pause
    | Icon_Logo
    | Icon_Microphone
    | Icon_TwitterOutlined
    | Icon_Tickets
    | Icon_Love
    | Icon_Respect
    | Icon_Organize
    | Icon_CustomerSupport
    | Icon_Card
    | Icon_HighFive
    | Icon_Moon
    | Icon_PaperPlane
    | Icon_Seo
    | Icon_Internet
    | Icon_Email
    | Icon_WaveHand
    | Icon_Sunrise
    | Icon_Sunset
    | Icon_Training
    | Icon_Startup
    | Icon_Fireworks
    | Icon_AlarmClock
    | Icon_Conversation
    | Icon_Sun
    | Icon_Close
    | Icon_QRCodeWithHole
    | Icon_QRCode
    | Icon_QRCodeSmall
    | Icon_Videos
    | Icon_VideosOutline


saFill : String -> Svg.Attribute msg
saFill cl =
    SA.fill cl


icon : Icon -> String -> Int -> Element msg
icon icon_ cl size =
    let
        ( viewBox, paths ) =
            iconViewBoxAndPaths icon_ cl
    in
    html <|
        Svg.svg
            [ SA.xmlSpace "http://www.w3.org/2000/svg"
            , SA.viewBox viewBox
            , SA.height <| String.fromInt size
            ]
            paths


iconViewBoxAndPaths : Icon -> String -> ( String, List (Svg.Svg msg) )
iconViewBoxAndPaths icon_ cl =
    case icon_ of
        Icon_Github ->
            ( "0 0 1024 1024"
            , [ Svg.path
                    [ saFill cl
                    , SA.fillRule "evenodd"
                    , SA.clipRule "evenodd"
                    , SA.d "M512 0a512 512 0 0 0-162 998c26 4 35-11 35-25v-95c-129 24-162-31-173-60-5-15-30-60-52-72-18-10-44-34-1-34 41-1 69 37 79 52 46 78 120 56 149 42 5-33 18-55 33-68-114-13-233-57-233-253 0-56 20-102 52-137-5-13-23-66 5-136 0 0 43-14 141 52a475 475 0 0 1 256 0c98-66 141-52 141-52 28 70 10 123 5 136 33 35 53 81 53 137 0 197-120 240-234 253 19 16 35 47 35 95l-1 140c0 14 10 30 35 25A513 513 0 0 0 512 0z"
                    ]
                    []
              ]
            )

        Icon_Twitter ->
            ( "0 0 300 244"
            , [ Svg.path [ saFill cl, SA.d "M94.7 243.2c112.5 0 174-93.2 174-174 0-2.6 0-5.2-.2-7.9 12-8.6 22.3-19.4 30.5-31.6a122 122 0 0 1-35.1 9.6 61.4 61.4 0 0 0 26.9-33.8c-11.8 7-25 12-38.8 14.8a61 61 0 0 0-104.2 55.8 173.6 173.6 0 0 1-126-64 61 61 0 0 0 18.9 81.7c-10-.3-19.5-3-27.7-7.6v.8c0 29.6 21 54.3 49 59.9a61.2 61.2 0 0 1-27.6 1 61.2 61.2 0 0 0 57.1 42.5A122.7 122.7 0 0 1 1 215.7a173 173 0 0 0 93.7 27.5" ] []
              ]
            )

        Icon_LookInside ->
            ( "0 0 425 300"
            , [ Svg.path
                    [ SA.id "curve"
                    , SA.style "fill: transparent;"
                    , SA.d "M6,150C49.63,93,105.79,36.65,156.2,47.55,207.89,58.74,213,131.91,264,150c40.67,14.43,108.57-6.91,229-145"
                    ]
                    []
              , Svg.text_
                    [ SA.x "25" ]
                    [ Svg.textPath [ SA.xlinkHref "#curve", SA.style <| "font-size: 20px; letter-spacing: 3px; -webkit-text-stroke: 2px white; fill: " ++ cl ]
                        [ Svg.text "Click to look how I'm working inside ➤" ]
                    ]
              ]
            )

        Icon_Play ->
            ( "0 0 60 60"
            , [ Svg.path [ saFill cl, SA.d "M45.6 29.2l-22-15a1 1 0 00-1.6.8v30a1 1 0 001.6.8l22-15a1 1 0 000-1.6zM24 43.2V16.8L43.2 30 24 43.1z" ] []
              , Svg.path [ saFill cl, SA.d "M30 0a30 30 0 100 60 30 30 0 000-60zm0 58a28 28 0 110-56 28 28 0 010 56z" ] []
              ]
            )

        Icon_Pause ->
            ( "0 0 60 60"
            , [ Svg.path [ saFill cl, SA.d "M30 0a30 30 0 100 60 30 30 0 000-60zm0 58a28 28 0 110-56 28 28 0 010 56z" ] []
              , Svg.path [ saFill cl, SA.d "M33 46h8V14h-8v32zm2-30h4v28h-4V16zM19 46h8V14h-8v32zm2-30h4v28h-4V16z" ] []
              ]
            )

        Icon_Logo ->
            ( "0 0 305 335"
            , [ Svg.path [ saFill "red", SA.d "M72 205l-50-50 50-50 50 50z" ] []
              , Svg.path [ saFill "#777", SA.d "M67 209l-50 50V159zM21 264l70-71v142zM98 334V193l141 141zM205 292L105 192h200zM71 72H0L71 1zM76 0v100l50 50V50z" ] []
              ]
            )

        Icon_Close ->
            ( "0 0 357 357"
            , [ Svg.path [ saFill cl, SA.d "M357 36L321 0 179 143 36 0 0 36l143 143L0 321l36 36 143-143 142 143 36-36-143-142z" ] [] ]
            )

        Icon_Microphone ->
            ( "0 0 58 58"
            , [ Svg.path [ saFill cl, SA.d "M44 28a1 1 0 00-1 1v6a14 14 0 01-28 0v-6a1 1 0 10-2 0v6a16 16 0 0015 16v5h-5a1 1 0 100 2h12a1 1 0 100-2h-5v-5a16 16 0 0015-16v-6c0-.6-.4-1-1-1z" ] []
              , Svg.path [ saFill cl, SA.d "M29 46c6 0 11-5 11-11V11a11 11 0 00-22 0v24c0 6 5 11 11 11zm-9-35a9 9 0 0118 0v24a9 9 0 01-18 0V11z" ] []
              ]
            )

        Icon_TwitterOutlined ->
            ( "0 0 511.3 511.3"
            , [ Svg.path [ saFill cl, SA.d "M508 94c-2-2-7-3-10-2l-17 6c10-12 17-25 21-38 2-4 1-7-1-10-3-3-7-3-11-2-24 11-45 19-62 25h-2c-14-8-48-26-72-26-62 1-111 53-111 117v3c-90-17-140-43-194-100l-8-8-6 10c-29 56-8 108 26 142-16-2-26-7-36-15-3-3-8-4-12-1-4 2-5 7-5 11 13 41 43 74 76 94-16 0-29-2-42-11-3-1-8-1-12 1s-5 7-3 12c15 44 46 67 94 73-25 15-58 27-109 28-5 0-10 4-11 8-2 5 0 10 3 13 31 25 101 40 187 40 152 0 277-136 277-304v-2c20-10 35-28 43-53 1-4 0-8-3-11zm-52 50l-5 1v15c0 158-117 287-260 287-79 0-132-13-161-27 60-5 95-24 122-45l21-15h-26c-49 0-79-14-97-47 16 5 32 5 50 4l21-1 3-17c-33-10-72-39-91-79 17 8 36 10 54 10h26l-21-16c-18-13-72-59-46-125 55 55 108 80 204 97l10 2v-24c0-54 42-98 94-99 20-1 53 17 62 22 6 3 11 4 16 2l46-17c-8 13-18 25-32 36-4 3-4 8-3 12 2 5 7 6 12 5l33-12c-6 12-15 25-32 31z" ] []
              ]
            )

        Icon_Tickets ->
            ( "0 0 512 512"
            , [ Svg.path [ saFill cl, SA.d "M512 224L453 42c-2-5-8-8-13-6L7 177c-5 1-8 7-7 12l28 86v192c0 5 5 10 10 10h456c5 0 10-5 10-10V276c0-6-5-10-10-10h-79l90-29c5-2 8-8 7-13zm-28 62v171H48V286h56v111a10 10 0 0020 0V286h360zm-133-20H46l-23-73 52-18 20 62a10 10 0 0019-7l-20-61L437 58l52 163-138 45z" ] []
              , Svg.path [ saFill cl, SA.d "M421 102c-1-5-7-8-12-7l-261 85a10 10 0 006 19l261-85c5-1 8-7 6-12zM377 167l50-16a10 10 0 00-6-19l-50 16a10 10 0 006 19zM419 213a10 10 0 0013 6l15-5a10 10 0 00-6-19l-15 5c-6 2-9 7-7 13zM391 211l-16 6a10 10 0 006 19l16-6a10 10 0 00-6-19zM251 187l-91 29a10 10 0 006 19l91-29a10 10 0 00-6-19zM114 420c-6 0-10 5-10 10v4a10 10 0 0020 0v-4c0-5-5-10-10-10zM162 323c0 5 4 10 10 10h274a10 10 0 000-20H172c-6 0-10 4-10 10zM446 351h-52a10 10 0 000 20h52a10 10 0 000-20zM446 417h-17a10 10 0 000 20h17a10 10 0 000-20zM393 417h-17a10 10 0 000 20h17a10 10 0 000-20zM268 351h-96a10 10 0 000 20h96a10 10 0 000-20z" ] []
              ]
            )

        Icon_Love ->
            ( "0 0 52 52"
            , [ Svg.path [ saFill cl, SA.d "M52 16.2C51.1 8 45.1 1.8 37.7 1.8a14 14 0 00-12 7c-2.5-4.4-6.8-7-11.6-7C6.8 1.8.8 7.8 0 16.2c0 .4-.3 2.4.4 5.5 1.1 4.6 3.6 8.7 7.2 12l18.1 16.5 18.5-16.5c3.6-3.3 6-7.4 7.2-12 .7-3.1.5-5 .4-5.5zm-2.5 5c-1 4.2-3.2 8-6.6 11L26 47.5 9 32.2c-3.4-3-5.6-6.8-6.6-11-.7-3-.4-4.6-.4-4.6v-.1C2.7 9 7.8 3.8 14 3.8c4.7 0 8.9 3 10.8 7.5l1 2.2.9-2.2a12 12 0 0111-7.5c6.4 0 11.5 5.3 12.1 12.8 0 0 .3 1.7-.4 4.7z" ] []
              ]
            )

        Icon_Respect ->
            ( "0 0 512 512"
            , [ Svg.path [ saFill cl, SA.d "M467.8 88.1a10 10 0 00-14.2 0 10 10 0 000 14.1c1.9 1.9 4.4 3 7 3a10 10 0 007-17zM238 323.6a10 10 0 00-14 0 10 10 0 000 14.2c1.8 1.8 4.4 2.9 7 2.9 2.6 0 5.2-1 7-3a10 10 0 000-14z" ] []
              , Svg.path [ saFill cl, SA.d "M492 121.3a10 10 0 10-17.4 9.9 134.3 134.3 0 01-21.8 161l-7.6 7.6a37.4 37.4 0 00-8.5-13.2L333.9 183.8c6.7-3.3 13-7.7 18.4-13.1L372 151a10 10 0 00-14.1-14.2L338 156.5a48.7 48.7 0 01-34.6 14.4H264a10 10 0 00-7 3l-30.2 30a23 23 0 01-32.5-32.4l68.8-68.9C305.3 60.6 371 51.3 423 80.1a10 10 0 009.7-17.5 155.1 155.1 0 00-95.1-17.9C307 48.7 279 61.6 256 82c-28.2-25-64-38.6-102-38.6-41.2 0-79.9 16-109 45S0 156.3 0 197.4a153 153 0 0045.1 109L49 310a10 10 0 002.1 1.6 37.5 37.5 0 0039 34.7v1.5a37.4 37.4 0 0039.2 37.7v1.5a37.4 37.4 0 0039.2 37.6 37.6 37.6 0 0064.3 28.2l14-14 18.8 18.9a37.4 37.4 0 0053.3 0 37.6 37.6 0 0011-28.5h1.9a37.6 37.6 0 0037.6-39.2h1.6a37.4 37.4 0 0037.6-39.1h1.5a37.4 37.4 0 0034.8-23.3 10 10 0 002.7-1.9l19.4-19.4a154.4 154.4 0 0025-185zm-403.4 205a17.6 17.6 0 01-17.7-17.6c0-4.7 1.8-9.2 5.2-12.5L93.3 279a17.6 17.6 0 0125 0 17.7 17.7 0 010 25l-17.2 17.2a17.6 17.6 0 01-12.5 5.2zm26.6 34a17.6 17.6 0 010-25l17.3-17.2a17.6 17.6 0 0125 0 17.7 17.7 0 010 25l-17.3 17.2a17.7 17.7 0 01-25 0zm39.2 39.2a17.6 17.6 0 010-25l17.2-17.2a17.6 17.6 0 0125 0 17.7 17.7 0 010 25l-17.2 17.2a17.7 17.7 0 01-25 0zm81.4 22l-17.2 17.2a17.6 17.6 0 01-25 0 17.7 17.7 0 010-25l17.2-17.3a17.6 17.6 0 0125 0 17.6 17.6 0 010 25zm186.7-95.8a17.6 17.6 0 01-25 0L356 284.1 316.7 245a10 10 0 00-14.1 14.1l80.8 80.8a17.7 17.7 0 01-25 25L277.6 284a10 10 0 00-14.2 14.2l39.2 39.1 41.6 41.6a17.7 17.7 0 01-25 25l-41.6-41.6a10 10 0 00-2.6-1.8l-11.9-11.9a10 10 0 00-14 14.1l55.6 55.7a17.7 17.7 0 01-25 25l-21.2-21.1a37.7 37.7 0 00-36.7-51.1 37.6 37.6 0 00-39.2-39.2 37.6 37.6 0 00-39.1-39.1 37.6 37.6 0 00-64.3-28.2L61.9 282c-2.1 2.2-4 4.6-5.5 7.1A133.1 133.1 0 0120 197.3c0-35.8 14-69.5 39.3-94.8 25.3-25.3 59-39.2 94.7-39.2a133 133 0 0187.7 32.6l-61.5 61.4a42.7 42.7 0 000 60.8 42.8 42.8 0 0060.8 0l27.2-27.2h35.3c2.9 0 5.8-.2 8.6-.6l110.4 110.4a17.7 17.7 0 010 25z" ] []
              ]
            )

        Icon_Organize ->
            ( "0 0 512 512"
            , [ Svg.path [ saFill cl, SA.d "M354 64h-54v-3c0-16-13-29-29-29h-19c-8-19-27-32-49-32h-2c-22 0-41 13-49 32h-19c-16 0-29 13-29 29v3H50C19 64 0 79 0 104v358c0 28 22 50 50 50h304c28 0 50-22 50-50V236a10 10 0 10-20 0v226c0 17-13 30-30 30H50c-17 0-30-13-30-30V104c0-5 0-20 30-20h54v14c0 6 4 10 10 10h176c6 0 10-4 10-10V84h54c17 0 30 13 30 30v34a10 10 0 1020 0v-34c0-28-22-50-50-50zm-74 24H124V61c0-5 4-9 9-9h26c4 0 8-3 9-7 4-15 18-25 33-25h2c15 0 29 10 33 25 1 4 5 7 9 7h26c5 0 9 4 9 9zm0 0" ] []
              , Svg.path [ saFill cl, SA.d "M394 180a10 10 0 00-10 10 10 10 0 0010 10 10 10 0 0010-10c0-3-1-6-3-8l-7-2zm0 0M502 322a10 10 0 00-10 10 10 10 0 0010 10 10 10 0 0010-10 10 10 0 00-10-10zm0 0" ] []
              , Svg.path [ saFill cl, SA.d "M511 185l-32-71c-1-4-5-6-9-6s-8 2-9 6l-32 71-1 5v298c0 13 11 24 24 24h36c13 0 24-11 24-24V376a10 10 0 10-20 0v70h-44V200h44v92a10 10 0 1020 0V190l-1-5zm-41-43l17 38h-34zm22 324v22c0 2-2 4-4 4h-36c-2 0-4-2-4-4v-22zm0 0M118 144a42 42 0 100 84 42 42 0 000-84zm0 64a22 22 0 110-44 22 22 0 010 44zm0 0M118 264a42 42 0 100 84 42 42 0 000-84zm0 64a22 22 0 110-44 22 22 0 010 44zm0 0M118 384a42 42 0 100 84 42 42 0 000-84zm0 64a22 22 0 110-44 22 22 0 010 44zm0 0M318 208H204a10 10 0 100 20h114a10 10 0 100-20zm0 0M318 160H204a10 10 0 100 20h114a10 10 0 100-20zm0 0M318 328H204a10 10 0 100 20h114a10 10 0 100-20zm0 0M318 280H204a10 10 0 100 20h114a10 10 0 100-20zm0 0M318 448H204a10 10 0 100 20h114a10 10 0 100-20zm0 0M318 400H204a10 10 0 100 20h114a10 10 0 100-20zm0 0" ] []
              ]
            )

        Icon_CustomerSupport ->
            ( "0 0 770 770"
            , [ Svg.path [ saFill cl, SA.d "M1.5 52.2l38 66.5a9.5 9.5 0 006 4.5l35.4 8.9 121.5 121.5 13.5-13.4L92.4 116.8a9.5 9.5 0 00-4.4-2.5l-34-8.6-32.4-56.6 27.7-27.7L106 53.7l8.5 34a9.5 9.5 0 002.5 4.5l123.5 123.4 13.4-13.4L132.4 80.7l-8.9-35.5a9.5 9.5 0 00-4.5-5.9l-66.5-38a9.5 9.5 0 00-11.4 1.5l-38 38c-3 3-3.7 7.7-1.6 11.4zm0 0M396.3 187.1l-208.9 209-13.4-13.5 208.9-208.9zm0 0M150.8 403.4a9.5 9.5 0 00-8-4.6h-57a9.5 9.5 0 00-8.2 4.6L49.1 451a9.5 9.5 0 000 9.8l28.5 47.5a9.5 9.5 0 008.1 4.6h57c3.3 0 6.4-1.8 8.1-4.6l28.5-47.5c1.8-3 1.8-6.8 0-9.8zm-13.5 90.4H91.1l-22.8-38 22.8-38h46.2l22.8 38zm0 0" ] []
              , Svg.path [ saFill cl, SA.d "M456 228A113.6 113.6 0 00566.6 86.3a9.5 9.5 0 00-16-4.4l-59 59-47-15.6L429 78.6l59.2-59.2a9.5 9.5 0 00-4.5-15.9 113.6 113.6 0 00-139.2 132.7l-208 208a114 114 0 1089.4 89.4l49.8-49.8 21.8 21.7a9.5 9.5 0 0013.4 0l4.8-4.7a10.6 10.6 0 0115 15l-4.7 4.8a9.5 9.5 0 000 13.4l113.3 113.3A76.6 76.6 0 10548 439.4l-.5-.5-113.3-113.2a9.5 9.5 0 00-13.4 0l-4.8 4.7a10.6 10.6 0 11-15-15l4.7-4.8a9.5 9.5 0 000-13.4L384 275.4l49.8-49.8c7.3 1.5 14.8 2.3 22.3 2.3zm37.4 322.8c-7 0-13.8-1.3-20.2-3.7l74.1-74.2a57.6 57.6 0 01-54 77.9zM385.8 304a29.6 29.6 0 0041.8 41.7L534 452.4c1.2 1.1 2.3 2.3 3.3 3.6l-81.2 81.2-3.6-3.3L346 427.2a29.6 29.6 0 00-41.8-41.7L289 370.3l81.6-81.5zm38.3-95.5L208.7 423.8a9.5 9.5 0 00-2.5 9 95.6 95.6 0 11-69-69c3.2.8 6.6-.2 9-2.5l215.4-215.4a9.5 9.5 0 002.5-9 94.5 94.5 0 0197.4-117.7l-50.1 50A9.5 9.5 0 00409 79l19 57c1 2.8 3.1 5 6 6l57 19c3.4 1 7.1.2 9.7-2.3l50-50.1c.2 1.8.2 3.6.2 5.4a94.5 94.5 0 01-117.9 92c-3.2-.8-6.7.1-9 2.5zm0 0" ] []
              , Svg.path [ saFill cl, SA.d "M491.3 477.6L477.8 491l-95-95 13.5-13.4zm0 0" ] []
              ]
            )

        Icon_Card ->
            ( "0 -84 512 512"
            , [ Svg.path [ saFill cl, SA.d "M467.7 0H44.3A44.3 44.3 0 000 44.3v255.1a44.3 44.3 0 0044.3 44.3h423.4a44.3 44.3 0 0044.3-44.3V44.3A44.3 44.3 0 00467.7 0zm29 299.4c0 16-13 29-29 29H44.3c-16 0-29-13-29-29V44.3c0-16 13-29 29-29h423.4c16 0 29 13 29 29zm0 0" ] []
              , Svg.path [ saFill cl, SA.d "M227.6 60.8H51.2a7.6 7.6 0 00-7.6 7.6v18.3a7.6 7.6 0 0015.2 0V76H220v185.6H58.8V117a7.6 7.6 0 00-15.2 0v152c0 4.3 3.4 7.7 7.6 7.7h176.4c4.2 0 7.6-3.4 7.6-7.6V68.4c0-4.2-3.4-7.6-7.6-7.6zm0 0M462.8 78.5H272.2a7.6 7.6 0 000 15.2h190.6a7.6 7.6 0 100-15.2zm0 0M462.8 133.6h-42.6a7.6 7.6 0 100 15.2h42.6a7.6 7.6 0 000-15.2zm0 0M272.2 148.8h117.6a7.6 7.6 0 000-15.2H272.2a7.6 7.6 0 100 15.2zm0 0M462.8 188.8H272.2a7.6 7.6 0 100 15.2h190.6a7.6 7.6 0 000-15.2zm0 0M375.6 244H272.2a7.6 7.6 0 100 15.2h103.4a7.6 7.6 0 000-15.3zm0 0" ] []
              , Svg.path [ saFill cl, SA.d "M86.2 244.8a7.6 7.6 0 0015.2 0 38 38 0 0176 0 7.6 7.6 0 1015.2 0 53.2 53.2 0 00-25.8-45.6 53.2 53.2 0 10-54.8 0 53.2 53.2 0 00-25.8 45.6zm15.2-91.2a38 38 0 1176.1 0 38 38 0 01-76.1 0zm0 0" ] []
              ]
            )

        Icon_HighFive ->
            ( "0 0 512 512"
            , [ Svg.path [ saFill cl, SA.d "M423.5 495a10 10 0 00-14.2 0 10 10 0 000 14 10 10 0 0014.2 0 10 10 0 000-14zM505 167.9a39.5 39.5 0 00-67.2 3.6V65.9a38.8 38.8 0 00-58-33.6 38.8 38.8 0 00-76.4 0 38.8 38.8 0 00-57.8 29.9A38.8 38.8 0 00188 96a10 10 0 0020 0 18.8 18.8 0 0137.4-2v26.6a10 10 0 0020 0V66a18.8 18.8 0 0137.4-1.9v77.8l.1 3.8a10 10 0 0020 0V65.9 38.8a18.8 18.8 0 0137.5 0v24.5l-.1 2.6v140.7a10 10 0 0020 0V64a18.8 18.8 0 0137.5 2v147.9a14 14 0 0012.5 14.1 14 14 0 0015.6-10.7l7.8-31.8a19.4 19.4 0 0137.9 8.4l-15.1 76.4c-5 25.6-17.5 49-36 67.4l-31.1 31a10 10 0 00-3 7.1V465a10 10 0 0020 0v-85l28.2-28.1a150.5 150.5 0 0041.5-77.7l15-76.4c2.1-10.5 0-21.1-6-30zM296.6 309a10 10 0 00-10 10v29.3a122 122 0 01-36.1 87l-19 19a10 10 0 00-3 7V502a10 10 0 0020 0v-36.5l16.1-16c27-27 42-63 42-101.2V319a10 10 0 00-10-10z" ] []
              , Svg.path [ saFill cl, SA.d "M303.7 276.4a10 10 0 00-14.2 0 10 10 0 000 14.2 10 10 0 0014.2 0 10 10 0 000-14.2zM269.5 160.5c-6.3 0-12.2 1.6-17.3 4.3a37.2 37.2 0 00-54.6-28.1 37.2 37.2 0 00-72.9 0A37.2 37.2 0 0070 169.3v97.3A37.8 37.8 0 006.7 265a37.4 37.4 0 00-6 28.6l14.3 72c5.5 28 19.1 53.4 39.3 73.6l26.4 26.3V502a10 10 0 0020 0v-40.7c0-2.6-1-5.2-3-7L68.4 425a122.5 122.5 0 01-33.8-63.2l-14.2-72a17.6 17.6 0 0114.3-21c9.2-1.5 18 4.3 20.3 13.3l7.3 30c1.8 7 8.2 11.4 15.3 10.5 7.1-.9 12.3-6.7 12.3-13.9V169.3a17.1 17.1 0 0134.2-1.8v73.3a10 10 0 0020.1 0v-71.5l-.1-2.5v-23.1a17.1 17.1 0 0134.2 0v97.1a10 10 0 0020.1 0v-73.3a17.1 17.1 0 0134 1.8v71.5a10 10 0 0020.1 0v-45a17.1 17.1 0 0134 1.8v46.7a10 10 0 0020 0v-46.7a37.2 37.2 0 00-37-37.1zM148.9 55.7L96 3a10 10 0 00-14 14.1l52.6 52.7a9.9 9.9 0 0014.1 0c4-3.9 4-10.2 0-14.1zM113.5 82.5H89.1a10 10 0 000 20h24.4a10 10 0 000-20zM171 0a10 10 0 00-10 10v25.2a10 10 0 1020 0V10a10 10 0 00-10-10z" ] []
              ]
            )

        Icon_Moon ->
            ( "0 0 383.19 383.19"
            , [ Svg.path [ saFill cl, SA.d "M226.38 123.66a8.88 8.88 0 00-6.16-1.92h-33.6l31.6-35.28 2.96-3.28 1.52-1.92c.53-.74.96-1.55 1.28-2.4a8 8 0 00.56-2.88 6 6 0 00-2.96-5.76 17.84 17.84 0 00-8.4-1.6H173.9a8.64 8.64 0 00-5.84 1.76 5.92 5.92 0 00-2.08 4.72c0 2.72.91 4.37 2.72 4.96 2.6.74 5.3 1.06 8 .96h25.6a86.75 86.75 0 01-4.16 5.28l-6.56 7.36-8.88 9.6-10.32 11.44c-3.57 4-5.92 6.66-7.04 8a7.52 7.52 0 00.72 10.32 10.88 10.88 0 007.36 2.16h46.72a9.12 9.12 0 006.24-1.84 6.08 6.08 0 002.08-4.72 6.4 6.4 0 00-2.08-4.96zM297.18 164.54a7.04 7.04 0 00-4.96-1.52h-26.88l25.2-28.16 2.4-2.64 1.52-1.84a8.4 8.4 0 001.04-1.92c.3-.74.47-1.52.48-2.32a4.8 4.8 0 00-2.32-4.64c-2.1-.97-4.4-1.4-6.72-1.28h-31.68a6.96 6.96 0 00-4.64 1.44 4.72 4.72 0 00-1.68 3.76c0 2.13.72 3.47 2.16 4 2.09.58 4.25.82 6.4.72h20.48c-.8 1.2-1.92 2.56-3.36 4.24l-5.28 5.92-6.88 8-8 9.12c-2.88 3.2-4.77 5.39-5.68 6.56a6 6 0 00.56 8 8.64 8.64 0 005.84 1.68h37.12a7.28 7.28 0 004.96-1.44 4.88 4.88 0 001.6-3.76 5.12 5.12 0 00-1.68-3.92zM381.1 119.58a8.88 8.88 0 00-6.16-1.92H341.1l31.6-35.28 2.96-3.28 1.92-2.32c.53-.74.96-1.55 1.28-2.4a8 8 0 00.56-2.88 6 6 0 00-2.96-5.76 17.85 17.85 0 00-8.4-1.6h-39.68a8.64 8.64 0 00-5.84 1.76 5.92 5.92 0 00-2.08 4.72c0 2.72.91 4.37 2.72 4.96 2.6.74 5.3 1.06 8 .96h25.6a86.75 86.75 0 01-4.16 5.28l-6.64 7.52-8.64 9.6-10.32 11.44c-3.57 4-5.92 6.66-7.04 8a7.52 7.52 0 00.72 10.32 10.88 10.88 0 007.36 2.16h46.64a9.12 9.12 0 006.4-1.6 6.08 6.08 0 002.08-4.72 6.4 6.4 0 00-2.08-4.96z" ] []
              , Svg.path [ saFill cl, SA.d "M353.5 254.3a8 8 0 00-8.8-1.84c-86.7 35.9-186.1-5.3-221.99-92a169.92 169.92 0 013.03-136.88 8 8 0 00-10.32-10.8C20.36 51.83-25.04 160.54 14 255.6s147.77 140.46 242.83 101.41a186.08 186.08 0 0098.12-93.84 8 8 0 00-1.45-8.88zM186.22 355.1c-93.97-.02-170.14-76.21-170.13-170.2a170.16 170.16 0 0187.33-148.6 183.42 183.42 0 00-9.6 58.8c0 102.81 83.36 186.15 186.17 186.15 17.23 0 34.38-2.4 50.95-7.11a170.8 170.8 0 01-144.72 80.96z" ] []
              ]
            )

        Icon_PaperPlane ->
            ( "0 0 512 512"
            , [ Svg.path [ saFill cl, SA.d "M507 1.3a10 10 0 00-10 0L313.6 109.9a10 10 0 1010.1 17.2l131.5-77.8-244.9 254.1-121.8-37.2 159-94a10 10 0 00-10.2-17.2L58.9 260.4a10 10 0 002.2 18.2L206.5 323l64.2 116.8.2.3a10 10 0 0015.6 2l73.8-72.1L499 412.6A10 10 0 00512 403V10c0-3.6-2-7-5-8.7zm-235.7 328a10 10 0 00-1.8 5.6v61.2l-43.8-79.8 193.9-201.2-148.3 214.1zm18.2 82v-62.9l49 15-49 48zM492 389.5l-196.5-60.1L492 45.7v343.8z" ] []
              , Svg.path [ saFill cl, SA.d "M164.4 347.6a10 10 0 00-14.1 0l-93.4 93.3a10 10 0 0014.2 14.2l93.3-93.4a10 10 0 000-14.1zM40 472a10 10 0 00-14 0L3 495a10 10 0 0014 14l23-23c4-3.8 4-10.2 0-14zM142.6 494.3a10 10 0 00-14 0 10 10 0 000 14.2 10 10 0 0014 0 10 10 0 000-14.2zM217 420a10 10 0 00-14 0l-49.5 49.4a10 10 0 0014.1 14.1l49.5-49.4a10 10 0 000-14.2zM387.7 416.1a10 10 0 00-14.1 0L324 465.7A10 10 0 00338 480l49.6-49.6a10 10 0 000-14.2zM283.5 136.3a10 10 0 00-14.1 0 10 10 0 007 17 10 10 0 007.1-17z" ] []
              ]
            )

        Icon_Seo ->
            ( "0 0 770 770"
            , [ Svg.path [ saFill cl, SA.d "M413.9 85.3a12.8 12.8 0 100 25.6 12.8 12.8 0 000-25.6zm0 0" ] []
              , Svg.path [ saFill cl, SA.d "M449.8 2.5a8.5 8.5 0 00-12.1 0l-68.3 68.3a8.5 8.5 0 00-2.5 6v59.7c0 4.7 3.9 8.6 8.6 8.6h59.7c2.3 0 4.4-1 6-2.5l68.3-68.3a8.5 8.5 0 000-12zM431.7 128H384V80.3l59.7-59.7 47.7 47.7zm0 0M8.5 290.1h25.6v1.1a33 33 0 0025.6 32.1v77.8c0 4.7 3.9 8.5 8.6 8.5h51.2c4.7 0 8.5-3.8 8.5-8.5v-34.2h8.6c14 0 25.5-11.4 25.5-25.5v-18a33 33 0 0023.6-21l143.6 63.8a8.5 8.5 0 0012-7.8V153.6a8.5 8.5 0 00-12-7.8l-143.6 63.9a33 33 0 00-31-22H67.2a33 33 0 00-33 33v1.2H8.4a8.5 8.5 0 00-8.5 8.5v51.2c0 4.7 3.8 8.5 8.5 8.5zM290.1 182l34.2-15.2v178.6L290 330zm-102.4 45.5l85.4-38v133.2l-85.4-38zm-76.8 131v34.1H76.8v-68.2h34.1zm34.2-17c0 4.7-3.8 8.5-8.5 8.5H128v-25.6h17zm-93.9-59.8v-60.8a16 16 0 0116-16h87.5a16 16 0 0116 16v70.4a16 16 0 01-16 16H67.2a16 16 0 01-16-16zm-34.1-42.7h17v34.2h-17zm0 0M425 335.5a8.5 8.5 0 00-12 0L352.6 396a8.5 8.5 0 000 12l84.5 84.5a8.5 8.5 0 0012 0l60.4-60.3a8.5 8.5 0 000-12zm56.1 80.3L433 412l-3.7-48.2zm-38 58.5L370.7 402l41.2-41.2 4.6 60a8.5 8.5 0 007.9 7.8l60 4.6zm0 0" ] []
              , Svg.path [ saFill cl, SA.d "M230.4 162.1a59.6 59.6 0 0047.8-95.4l52.1-52.1-12-12.1L266 54.6a59.7 59.7 0 10-35.7 107.5zm0-102.4a42.7 42.7 0 110 85.4 42.7 42.7 0 010-85.4zm0 0M367 298.7h42.6v8.5c0 4.7 3.8 8.5 8.5 8.5h68.3c4.7 0 8.5-3.8 8.5-8.5v-42.5c0-14.5-9.2-27.4-22.8-32.2a34.1 34.1 0 10-39.6 0c-5.5 2-10.5 5.3-14.3 9.7-3-3.4-6.6-6.2-10.7-8.2a25.6 25.6 0 10-30 0 34 34 0 00-19.1 30.5v25.6c0 4.7 3.8 8.6 8.5 8.6zm85.3-111a17 17 0 110 34.2 17 17 0 010-34.2zm-25.6 102.4v-25.4c0-9.5 7.7-17.2 17.2-17.2h16.7c9.5 0 17.3 7.7 17.3 17.2v34h-51.2zm-34.2-85.3a8.5 8.5 0 110 17 8.5 8.5 0 010-17zm-17 59.7a17 17 0 1134.1 0v17.1h-34.1zm0 0M239 349.9h-34.2c-2.3 0-4.4.9-6 2.5l-51.2 51.2a8.5 8.5 0 000 12l93.8 93.9a8.5 8.5 0 0012.1 0l68.3-68.3a8.5 8.5 0 000-12L245 352.4a8.5 8.5 0 00-6-2.5zm8.5 141.5l-81.8-81.8 42.6-42.7h27.1l68.3 68.3zm0 0" ] []
              , Svg.path [ saFill cl, SA.d "M198.8 420.6l34.1-34.1 12 12-34 34.2zm0 0M224.4 446.2l34.1-34.1 12 12-34 34.2zm0 0" ] []
              ]
            )

        Icon_Internet ->
            ( "0 0 58 58"
            , [ Svg.path [ saFill cl, SA.d "M50.7 48.2a28.9 28.9 0 00-.6-39 29 29 0 00-20-9.2H28A28.9 28.9 0 007.3 48.2v.1A29 29 0 0028 58h2a29 29 0 0020.6-9.7zM2 30h12a37 37 0 002.4 12.2c-2.8 1-5.5 2.4-8 4.1C4.5 42 2.2 36.3 2 30zM9 11c2.5 1.6 5.1 3 7.9 3.9A37 37 0 0014 28H2c.3-6.5 2.8-12.4 6.9-17zm47 17H44c0-4.6-1-9-2.7-13.1 2.8-1 5.4-2.3 8-3.9 4 4.6 6.5 10.5 6.8 17zM28 15a35 35 0 01-8.5-1.3c2-4.2 5-8 8.5-11V15zm0 2v11H16a35 35 0 012.7-12.5A37 37 0 0028 17zm2 0a37 37 0 009.3-1.5A35 35 0 0142 28H30V17zm0-2V2.6a35 35 0 018.5 11A35 35 0 0130 15zm10.4-2a37 37 0 00-7.9-10.8 27 27 0 0115.2 7.4 34.8 34.8 0 01-7.3 3.5zm-22.8 0c-2.6-.8-5-2-7.3-3.4a27 27 0 0115.2-7.4 37 37 0 00-8 10.9zM16 30h12v10c-3.3.1-6.5.6-9.7 1.6A35 35 0 0116 30zm12 12v13.4a35 35 0 01-8.9-12C22 42.6 25 42.1 28 42zm2 13.4V42c3 .1 6 .6 8.9 1.4a35 35 0 01-8.9 12zM30 40V30h12c-.1 4-1 8-2.3 11.6-3.2-1-6.4-1.5-9.7-1.6zm14-10h12a26.9 26.9 0 01-6.3 16.3 36.9 36.9 0 00-8.1-4A37 37 0 0044 30zM9.7 47.8c2.4-1.5 4.9-2.8 7.5-3.7 2 4.3 4.7 8.3 8.3 11.7a27 27 0 01-15.8-8zm22.8 8c3.6-3.4 6.3-7.4 8.3-11.7 2.6 1 5.1 2.2 7.5 3.7a27 27 0 01-15.8 8z" ] []
              ]
            )

        Icon_Email ->
            ( "0 0 512 512"
            , [ Svg.path [ saFill cl, SA.d "M486.4 59.7H25.6A25.6 25.6 0 000 85.3v341.4a25.6 25.6 0 0025.6 25.6h460.8a25.6 25.6 0 0025.6-25.6V85.3a25.6 25.6 0 00-25.6-25.6zm8.5 367c0 4.7-3.8 8.5-8.5 8.5H25.6a8.5 8.5 0 01-8.5-8.5V85.3c0-4.7 3.8-8.5 8.5-8.5h460.8c4.7 0 8.5 3.8 8.5 8.5v341.4z" ] []
              , Svg.path [ saFill cl, SA.d "M470 93.9c-2.2-.2-4.4.5-6.2 2L267 261.2a17 17 0 01-22 0L48.2 96a8.5 8.5 0 00-11 13L234 274.3a34 34 0 0044 0l196.8-165.4a8.5 8.5 0 00-4.7-15zM164.1 273.1c-3-.6-6.1.4-8.2 2.7l-119.5 128A8.5 8.5 0 1049 415.4l119.5-128a8.5 8.5 0 00-4.3-14.3zM356.1 275.8a8.5 8.5 0 10-12.5 11.6l119.5 128a8.5 8.5 0 0012.5-11.6L356 275.8z" ] []
              ]
            )

        Icon_WaveHand ->
            ( "0 0 297.7 297.7"
            , [ Svg.path [ saFill cl, SA.d "M40.2 77a37.1 37.1 0 0137-37 6 6 0 000-12c-27 0-49 22-49 49a6 6 0 0012 0z" ] []
              , Svg.path [ saFill cl, SA.d "M77.3 12a6 6 0 000-12C34.8 0 .2 34.6.2 77a6 6 0 0012 0c0-35.8 29.2-65 65-65zM220.4 28a6 6 0 000 12 37.1 37.1 0 0137.1 37 6 6 0 0012 0c0-27-22-49-49-49z" ] []
              , Svg.path [ saFill cl, SA.d "M220.4 0a6 6 0 000 12c36 0 65.1 29.2 65.1 65a6 6 0 0012 0c0-42.4-34.6-77-77-77zM227.5 80.6c-1 0-1.8 0-2.8.2a23 23 0 00-11.2 4.3v-5.2A25.6 25.6 0 00188.1 54c-5.2 0-10.2 1.6-14.4 4.5A25.5 25.5 0 00148.4 35a25.2 25.2 0 00-25.3 23.8 25 25 0 00-14.4-4.6 26 26 0 00-26.2 25.4v86L77 160a24.9 24.9 0 00-35.3.1 25.3 25.3 0 00-.6 35l53.9 71 1.1 15.3c.7 9.1 8.5 16.3 17.6 16.3h98.5c8.8 0 16.3-6.7 17.4-15.4l2.4-18.2a138 138 0 0016.3-48.2c3-17.3 4.2-37.8 4.2-61v-49a25 25 0 00-25-25.3zm-9.8 200.1c-.3 2.8-2.7 5-5.5 5l-98.5.2c-3 0-5.4-2.4-5.6-5.3l-1.4-18.8-56.4-74.5a13.3 13.3 0 019.4-22.6c3.4 0 6.8 1.3 9.3 3.9l15.9 15c1.2 1.1 2.3 1.7 3.8 1.7 3.2 0 5.8-2.5 5.8-6.2V79.5a13.8 13.8 0 0115.3-13.3c6.8.8 11.7 6.8 11.7 13.7v68.6c0 3.6 3 6.5 6.5 6.5 3.6 0 6.5-3 6.5-6.6V60.2A13.6 13.6 0 01149.7 47c6.8.8 11.8 6.9 11.8 13.7v87.8c0 3.6 3 6.6 6.6 6.6 3.5 0 6.4-3 6.4-6.5v-69a13.5 13.5 0 0115.2-13.3c6.8.8 11.8 6.8 11.8 13.7v68.4c0 3.7 3 6.6 6.7 6.6h.1c3.4 0 6.2-2.7 6.2-6.1v-42.4c0-6.9 5-13 11.8-13.7l1.2-.1c7.4 0 13 6 13 13.4v49c0 41.8-4.7 80.4-19.7 103.8-.5.7-.6 1.5-.7 2.4l-2.4 19.5z" ] []
              ]
            )

        Icon_Sunrise ->
            ( "0 0 64 64"
            , [ Svg.path [ saFill cl, SA.d "M54 56c-2.2 0-4.27.86-5.83 2.41l-.76.76a6.2 6.2 0 01-8.82 0l-.76-.76C36.27 56.86 34.2 56 32 56s-4.27.86-5.83 2.41l-.76.76a6.2 6.2 0 01-8.82 0l-.76-.76C14.27 56.86 12.2 56 10 56s-4.27.86-5.83 2.41L1.3 61.3l1.42 1.42 2.88-2.88a6.2 6.2 0 018.82 0l.76.76C16.73 62.14 18.8 63 21 63s4.27-.86 5.83-2.41l.76-.76a6.2 6.2 0 018.82 0l.76.76C38.73 62.14 40.8 63 43 63s4.27-.86 5.83-2.41l.76-.76a6.2 6.2 0 018.82 0l2.88 2.88 1.42-1.42-2.88-2.88A8.19 8.19 0 0054 56zM31 1h2v14h-2zM63 41v-2H52.95c-.53-11.11-9.7-20-20.95-20s-20.42 8.89-20.95 20H1v2h10.04a20.8 20.8 0 001.76 7.5 8.24 8.24 0 00-8.63 1.91L1.3 53.3l1.42 1.42 2.88-2.88a6.2 6.2 0 018.82 0l.76.76C16.73 54.14 18.8 55 21 55s4.27-.86 5.83-2.41l.76-.76a6.2 6.2 0 018.82 0l.76.76C38.73 54.14 40.8 55 43 55s4.27-.86 5.83-2.41l.76-.76a6.2 6.2 0 018.82 0l2.88 2.88 1.42-1.42-2.88-2.88a8.19 8.19 0 00-8.63-1.91 20.8 20.8 0 001.76-7.5zM38.59 51.17l-.76-.76C36.27 48.86 34.2 48 32 48s-4.27.86-5.83 2.41l-.76.76a6.2 6.2 0 01-8.68.13A19.02 19.02 0 0132 21a19.02 19.02 0 0115.27 30.3 6.2 6.2 0 01-8.68-.13zM1.3 10.7l1.4-1.4 13 13-1.41 1.4zM48.29 22.3l13-13 1.4 1.41-12.99 13zM18.13 10.5l1.73-1 4 7-1.74 1zM40.12 16.51l4-7 1.74 1-4 7z" ] []
              , Svg.path [ saFill cl, SA.d "M1.64 28.93l.7-1.88 8 3-.7 1.87zM53.63 30.06l8-3 .7 1.87-8 3z" ] []
              ]
            )

        Icon_Sunset ->
            ( "0 0 512 512"
            , [ Svg.path [ saFill cl, SA.d "M0 290.13h512v17.07H0zM324.27 341.33h102.4v17.07h-102.4zM162.13 341.33H307.2v17.07H162.13zM85.33 341.33h59.73v17.07H85.33zM230.4 392.53h162.13v17.07H230.4zM119.47 392.53h93.87v17.07h-93.87zM196.27 443.73h170.67v17.07H196.27zM145.07 443.73h34.13v17.07h-34.13zM187.73 494.93h136.53V512H187.73z" ] []
              , Svg.path [ saFill cl, SA.d "M420.32 159.1c-39.4-90.6-145.18-132.25-235.8-92.84-90.61 39.42-132.26 145.2-92.85 235.8l15.65-6.8a161.07 161.07 0 01-2.18-124.07c15.86-40.3 46.47-72 86.19-89.28 81.97-35.66 177.68 2.02 213.35 84a162.6 162.6 0 010 129.34l15.65 6.82a179.74 179.74 0 00-.01-142.97zM34.13 13.56A49.4 49.4 0 000 0v17.07c8.71 0 16.9 3.38 23.07 9.53l5.03 5.03a8.51 8.51 0 0012.07 0l5.02-5.02a32.46 32.46 0 0123.08-9.54V0C55.47 0 43.4 4.8 34.13 13.56zM59.73 73.3A49.4 49.4 0 0025.6 59.72V76.8c8.71 0 16.9 3.39 23.07 9.53l5.03 5.04a8.51 8.51 0 0012.07 0l5.02-5.03a32.46 32.46 0 0123.08-9.54V59.73c-12.8 0-24.86 4.8-34.14 13.56zM119.47 30.63a49.4 49.4 0 00-34.14-13.56v17.06c8.72 0 16.9 3.4 23.07 9.54l5.04 5.03a8.51 8.51 0 0012.06 0l5.03-5.03a32.46 32.46 0 0123.07-9.54V17.07c-12.8 0-24.86 4.8-34.13 13.56z" ] []
              ]
            )

        Icon_Training ->
            ( "0 0 770 770"
            , [ Svg.path [ saFill cl, SA.d "M120 32h80v16h-80zm0 0M144 96h-16v88h-16v-64H96v64H80v-40H64v40H48v16h112v-16h-16zm0 0M48 216h16v16H48zm0 0M80 216h80v16H80zm0 0" ] []
              , Svg.path [ saFill cl, SA.d "M472 328c13 0 24-11 24-24V181c0-16-12-30-27-32l-29-4v-13c10-9 16-22 16-36V80a48 48 0 00-96 0v16c0 14 6 27 16 36v13l-45 6-27-31V80h16V32h-85L203 0h-86L85 32H0v48h16v192H0v48h80v22L27 480H0v16h496v-16h-32V327l8 1zm-56-99l-8 8-8-8 7-53h2zM376 80a32 32 0 0164 0v16a32 32 0 01-64 0zm32 64c6 0 11-1 16-3v9c-2 3-7 10-16 10s-14-7-16-10v-9c5 2 10 3 16 3zm-28 17c2 3 6 7 12 10l-8 64 24 24 24-24-8-64c6-3 10-7 12-10l30 4c8 1 14 8 14 16v123a8 8 0 01-16 0V192h-16v80h-80v-80h-48c-3 0-5-1-7-3l-55-69-2-6v-1a9 9 0 0115-6l54 62zM136 352v128H76l49-128zm16 0h16v128h-16zm32 0h11l49 128h-60zm28 0h15l49 128h-15zm28-10v-22h80v-48h-16v-70c4 4 10 6 16 6h32v272h-59zm128-54h32v192h-32zM16 48h75l32-32h74l32 32h75v16H16zm16 32h256v22l-5-6a25 25 0 00-43 17v1c0 6 2 11 5 16l43 53v89H32zM16 288h288v16H16zm208 32v16H96v-16zM93 352h15L59 480H44zm323 128V288h32v192zm0 0" ] []
              , Svg.path [ saFill cl, SA.d "M224 160a48 48 0 100 96 48 48 0 000-96zm-8 17v23h-23c3-11 12-20 23-23zm-23 39h23v23c-11-3-20-12-23-23zm39 23v-62a32 32 0 010 62zm0 0" ] []
              ]
            )

        Icon_Startup ->
            ( "0 0 512 512"
            , [ Svg.circle [ SA.cx "10.1", SA.cy "500.4", SA.r "10.1" ] []
              , Svg.circle [ SA.cx "267", SA.cy "245.3", SA.r "10" ] []
              , Svg.path [ saFill cl, SA.d "M398.5 118a42.4 42.4 0 00-60.5 0 42.8 42.8 0 1060.5 0zm-14.2 46.3a22.7 22.7 0 11-32-32.1 22.7 22.7 0 0132 32zM125.4 411.4A10 10 0 00112 416l-12 24a33.1 33.1 0 01-27.2 18.2l-14 1c-2.3.1-3.8-1-4.5-1.8s-2-2.2-1.8-4.6l1-13.9a33.1 33.1 0 0118.2-27.3l24-12a10 10 0 10-9-18l-24 12a53.3 53.3 0 00-29.2 44l-1 13.8a26 26 0 0027.8 27.8l13.9-1A53.3 53.3 0 00118 449l12-24c2.4-5 .4-11-4.6-13.4z" ] []
              , Svg.path [ saFill cl, SA.d "M505 8.2c-4.6-4.7-11.1-7-17.7-6.7l-9.4.6a303 303 0 00-215.2 111l-22 27.1-57.6-1.7h-.3c-45.6 0-88.6 17.8-120.9 50.1l-59 59a10 10 0 006.6 17.1l124.9 6.4-5.1 6.3a10 10 0 00-1 11.1c2 3.6 4 7.2 6.1 10.6l-29.6 35.2a10 10 0 00-1.4 10.8 131.5 131.5 0 0062.8 62.7 10 10 0 0010.6-1.3c6.4-5.1 13.7-11.3 20.8-17.2l15.1-12.6c3 1.8 5.9 3.5 8.8 5a10 10 0 0011-.8l6.8-5.3 6.5 125.4a10 10 0 0017.1 6.5l59-59c32.3-32.2 50-75.2 50-120.8v-55l23.3-18a301.7 301.7 0 00116.5-224l.3-4.8c.3-6.6-2.2-13-7-17.7zM33.2 245.8l43-43a150 150 0 01106.6-44.2l42 1.3-74.6 92-117-6zm151.7 128c-5.3 4.4-10.6 9-15.6 13a110.8 110.8 0 01-44.8-44.7l21.7-25.7a232.8 232.8 0 0049.2 48.7l-10.5 8.8zm167-46.1c0 40.3-15.6 78.2-44.1 106.7l-43 43-6-116.8 93.2-72.3v39.4zm139.9-298a281.7 281.7 0 01-108.8 209L225.5 361c-13.1-7.6-25.3-16.6-36.4-26.8l53-53a10 10 0 00-14.1-14.3l-53 53a212.6 212.6 0 01-25.8-35l129.1-159a282.8 282.8 0 01201-103.6l9.3-.6a3.2 3.2 0 013.3 3.3l-.2 4.9z" ] []
              ]
            )

        Icon_Fireworks ->
            ( "0 0 512 512"
            , [ Svg.path [ saFill cl, SA.d "M288.7 244.3L268 231.5l5.8-23.6a7.5 7.5 0 00-10.8-8.4l-21.4 11.6-17.5-16.9a7.5 7.5 0 00-12.7 5.2l-.7 24.3-23.3 6.8a7.5 7.5 0 00-1.9 13.6l20.7 12.7-5.8 23.6a7.5 7.5 0 0010.8 8.4l21.4-11.6 17.5 16.9a7.5 7.5 0 0012.7-5.2l.7-24.3 23.3-6.7a7.5 7.5 0 001.9-13.6zm-34.7 7.4a7.5 7.5 0 00-5.4 7l-.3 12.8-9.2-9a7.5 7.5 0 00-8.8-1.1l-11.3 6 3.1-12.3c.8-3.2-.6-6.5-3.3-8.2l-11-6.7 12.3-3.6a7.5 7.5 0 005.5-7l.3-12.8 9.2 9c2.4 2.2 6 2.7 8.8 1.1l11.3-6-3.1 12.3c-.8 3.2.5 6.5 3.3 8.2l11 6.7-12.4 3.6zM168.4 211L95 186a7.5 7.5 0 10-4.9 14.2l73.5 25a7.5 7.5 0 104.8-14.2zM223.5 164.2L195.8 69a7.5 7.5 0 00-14.4 4.2l27.7 95.2a7.5 7.5 0 0014.4-4.2zM354.6 92.5c-3.3-2.6-8-2-10.5 1.3l-63.9 82.4a7.5 7.5 0 1011.9 9.2l63.8-82.4c2.5-3.3 2-8-1.3-10.5zM271.5 89.8c-4-.9-8 1.7-9 5.7L243.3 182a7.5 7.5 0 1014.6 3.3L277 98.8c1-4-1.6-8-5.6-9zM194 184.3l-38-42.7a7.5 7.5 0 00-11.2 10l38 42.7a7.5 7.5 0 0010.5.6 7.5 7.5 0 00.6-10.6zM169 249.5c-.4-4-4-7.2-8.1-6.8l-43.2 3.4a7.5 7.5 0 001.2 15l43.2-3.5c4.1-.3 7.2-4 6.9-8zM198.1 20.6a23.6 23.6 0 10-4.7 17.4c3.8-5 5.5-11.2 4.7-17.4zm-16.6 8.1a8.5 8.5 0 01-12 1.6 8.5 8.5 0 01-1.5-12 8.5 8.5 0 0113.5 10.4zM69 174a23.4 23.4 0 00-26.3-20.3A23.4 23.4 0 0022.4 180a23.4 23.4 0 0026.3 20.4A23.4 23.4 0 0069 174.1zm-16.5 8.3a8.5 8.5 0 01-12 1.5 8.5 8.5 0 01-1.5-12 8.5 8.5 0 0112-1.5 8.5 8.5 0 011.5 12zM393.8 41.8a23.4 23.4 0 00-33 4.2 23.4 23.4 0 004.2 33 23.4 23.4 0 0033-4.2c8-10.3 6.1-25.1-4.2-33zm-7.6 23.8A8.5 8.5 0 11372.7 55a8.5 8.5 0 0113.5 10.5zM329 367.2l-42.7-64.8a7.5 7.5 0 00-12.5 8.2l42.7 64.8a7.5 7.5 0 1012.5-8.2zM417 240.3l-99-3a7.5 7.5 0 00-.5 15l99 3h.3a7.5 7.5 0 00.2-15zM378 172.3a7.5 7.5 0 00-10.2-3.3L289 209.3a7.5 7.5 0 006.8 13.3l79-40.2a7.5 7.5 0 003.2-10.1zM356.6 297l-50.8-26a7.5 7.5 0 00-6.8 13.3l50.8 26a7.5 7.5 0 0010-3.2c2-3.7.5-8.2-3.2-10.1zM265.1 360.2l-7.5-42.6a7.5 7.5 0 00-14.8 2.5l7.5 42.7a7.5 7.5 0 1014.8-2.6zM480.7 230.7a23.4 23.4 0 00-33 4.2 23.4 23.4 0 004.2 33 23.4 23.4 0 0033-4.2c8-10.2 6-25-4.2-33zm-7.7 23.8a8.5 8.5 0 01-12 1.6 8.5 8.5 0 01-1.4-12 8.5 8.5 0 0112-1.5 8.5 8.5 0 011.4 12zM364.3 394a23.6 23.6 0 10-28.8 37.3 23.6 23.6 0 0028.8-37.2zm-7.6 23.9a8.5 8.5 0 01-12 1.5 8.5 8.5 0 1112-1.5zM186 298.7a7.5 7.5 0 00-10.6.2c-3.7 3.8-91.8 95.5-133 203a7.5 7.5 0 0014 5.3c40.1-104.5 128.9-197 129.8-197.9 2.9-3 2.8-7.7-.2-10.6z" ] []
              ]
            )

        Icon_AlarmClock ->
            ( "0 0 58.15 58.15"
            , [ Svg.path [ saFill cl, SA.d "M40.08 29.15h-7.15a4 4 0 00-2.85-2.85V16.14a1 1 0 10-2 0V26.3a4 4 0 104.85 4.86h7.15a1 1 0 100-2zm-11 3a2 2 0 110-4 2 2 0 010 4z" ] []
              , Svg.path [ saFill cl, SA.d "M50.19 9.76l4.1 4.1a1 1 0 001.4 0A8.13 8.13 0 0044.22 2.38a1 1 0 000 1.4l4.56 4.57-1.7 1.7a26.89 26.89 0 00-36 0l-1.7-1.7 4.57-4.56a1 1 0 000-1.42A8.13 8.13 0 002.46 13.87a1 1 0 001.4 0l4.1-4.1 1.68 1.68a26.9 26.9 0 00-7.56 18.71c0 9.9 5.35 18.57 13.32 23.27l-3.03 3.03a1 1 0 101.41 1.41l3.45-3.45a26.83 26.83 0 0023.69 0l3.45 3.45a1 1 0 001.41 0 1 1 0 000-1.41l-3.02-3.03a27.01 27.01 0 0013.32-23.27 26.9 26.9 0 00-7.57-18.71l1.68-1.68zm4.1-5.97a6.13 6.13 0 01.64 7.9L46.4 3.13a6.13 6.13 0 017.9.65zm-51.07 7.9a6.13 6.13 0 018.54-8.55l-8.54 8.54zm25.86 43.46c-13.79 0-25-11.21-25-25s11.21-25 25-25 25 11.22 25 25-11.22 25-25 25z" ] []
              , Svg.path [ saFill cl, SA.d "M29.08 10.03a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1zM29.08 50.03a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1zM50.08 31.03h1a1 1 0 100-2h-1a1 1 0 100 2zM8.08 29.03h-1a1 1 0 100 2h1a1 1 0 100-2zM43.93 13.77l-.71.7a1 1 0 101.41 1.42l.71-.7a1 1 0 10-1.41-1.42zM13.52 44.17l-.7.71a1 1 0 101.4 1.41l.71-.7a1 1 0 10-1.41-1.42zM44.63 44.17a1 1 0 10-1.41 1.42l.7.7a1 1 0 001.42 0 1 1 0 000-1.4l-.7-.72zM14.23 13.77a1 1 0 10-1.42 1.41l.71.7a1 1 0 001.41 0 1 1 0 000-1.4l-.7-.71z" ] []
              ]
            )

        Icon_Conversation ->
            ( "0 0 512 512"
            , [ Svg.path [ saFill cl, SA.d "M346 319a10 10 0 00-10 10v69c0 27.57-22.43 50-50 50H178.03a10 10 0 00-10 10l-.01 19.87-23.87-23.86a10 10 0 00-9.17-6.01H70c-27.57 0-50-22.43-50-50V244c0-27.57 22.43-50 50-50h101a10 10 0 000-20H70c-38.6 0-70 31.4-70 70v154c0 38.6 31.4 70 70 70h59.86l41.07 41.07a10 10 0 0017.07-7.06l.02-34.01H286c38.6 0 70-31.4 70-70v-69a10 10 0 00-10-10z" ] []
              , Svg.path [ saFill cl, SA.d "M366.65 0h-25.3C261.2 0 196 65.2 196 145.35s65.2 145.34 145.34 145.34h25.31c12.51 0 24.9-1.59 36.9-4.73l37.38 37.37a10 10 0 0017.07-7.07V258.4a146.74 146.74 0 0038.2-47.1 143.78 143.78 0 0015.8-65.95C512 65.2 446.8 0 366.65 0zm75.33 245.53a10 10 0 00-3.98 8v38.6l-24.47-24.47a10 10 0 00-10-2.48 125.38 125.38 0 01-36.87 5.51h-25.31C272.23 270.7 216 214.46 216 145.35S272.23 20 341.35 20h25.3C435.78 20 492 76.23 492 145.35c0 39.73-18.23 76.25-50.02 100.19z" ] []
              , Svg.path [ saFill cl, SA.d "M399.03 109.42a42.43 42.43 0 00-39.25-39.25 42.01 42.01 0 00-31.86 11.28 42.49 42.49 0 00-13.46 30.95 10 10 0 0020 0c0-6.26 2.52-12.06 7.1-16.33a22.35 22.35 0 0137.52 14.73 22.24 22.24 0 01-17.37 23.4 18.92 18.92 0 00-14.91 18.55v24.02a10 10 0 0020 0v-23.22a42.12 42.12 0 0032.23-44.13zM363.87 209.26c-1.86-1.86-4.44-2.93-7.07-2.93s-5.21 1.07-7.07 2.93a10.08 10.08 0 00-2.93 7.07c0 2.64 1.07 5.22 2.93 7.08 1.86 1.86 4.44 2.92 7.07 2.92s5.21-1.06 7.07-2.92a10.1 10.1 0 002.93-7.08c0-2.63-1.07-5.21-2.93-7.07zM275 310H64a10 10 0 000 20h211a10 10 0 100-20zM282.07 368.93c-1.86-1.86-4.44-2.93-7.07-2.93s-5.21 1.07-7.07 2.93c-1.86 1.86-2.93 4.44-2.93 7.07s1.07 5.21 2.93 7.07c1.86 1.86 4.44 2.93 7.07 2.93s5.21-1.07 7.07-2.93A10.05 10.05 0 00285 376c0-2.63-1.07-5.21-2.93-7.07zM235.67 366H64a10 10 0 000 20h171.67a10 10 0 100-20zM210 254H64a10 10 0 000 20h146a10 10 0 100-20z" ] []
              ]
            )

        Icon_Sun ->
            ( "0 0 397.4 397.4"
            , [ Svg.path [ saFill cl, SA.d "M173.6 97.8l-22-22.2a7.3 7.3 0 10-10.2 10.2l21.9 22.2a7.3 7.3 0 0010.3-10.2zM359 76.8a7.3 7.3 0 00-11 0l-22.1 21.8A7.3 7.3 0 10336 109L358 87c3.2-2.5 3.6-7.1 1-10.2zM227.3 72.2l-.2-.6-8-30a7.2 7.2 0 10-14 3.6l8 30a7.2 7.2 0 0014.2-3zM326.7 227.1l-4.2-4 1.2-2.1a83 83 0 00-42.2-116.3l-.2-.2a83 83 0 00-103 36 94.3 94.3 0 00-119.6 91.1v3.8a63.2 63.2 0 004 126.2H271a78.8 78.8 0 0055.8-134.5zm-101.4-109a68.4 68.4 0 0185.4 96.1v.6a78.8 78.8 0 00-66.1-6 94.2 94.2 0 00-23.9-42.8c8.1-15 26.1-21.6 42-15.4a7.2 7.2 0 005.4-13.5 48 48 0 00-58.6 19.1 94.5 94.5 0 00-17.6-10.4 68.4 68.4 0 0133.4-27.8zM286 345.2c-5 1.2-10 1.8-15 1.7H63a48.7 48.7 0 01-34.5-83 48.5 48.5 0 0134.3-14.2H66.3a7.2 7.2 0 007.6-8.6l-.4-4.6v-5a79.8 79.8 0 01158.4-11.8 7.2 7.2 0 0010.4 5.5 64.3 64.3 0 1143.8 120zM397 145.4a7.2 7.2 0 00-8.3-5l-30.1 8a7.2 7.2 0 103.6 14l30-8c4-1.1 6-5.2 4.9-9zM392 216.2l-30-8.2a7.3 7.3 0 10-4 14l30 8.1a7.3 7.3 0 104-14zM289.8 36.7a7.3 7.3 0 00-9 5l-8.2 30a7.2 7.2 0 005 9 7.2 7.2 0 009.1-5l8-30a7.3 7.3 0 00-5-9z" ] []
              ]
            )

        Icon_Videos ->
            ( "0 0 310 310"
            , [ Svg.path [ saFill cl, SA.d "M298 65c-11-14-32-19-71-19H83c-40 0-61 6-72 20S0 100 0 128v54c0 54 13 82 83 82h144c34 0 53-5 65-16 13-12 18-32 18-66v-54c0-30-1-50-12-63zm-99 97l-65 34a10 10 0 01-15-8v-68a10 10 0 0115-9l65 34a10 10 0 010 17z" ] []
              ]
            )

        Icon_VideosOutline ->
            ( "0 -62 512 512"
            , [ Svg.path [ saFill cl, SA.d "M335 171l-113-62c-7-3-14-3-21 0-6 4-10 11-10 18v123a21 21 0 0021 21l10-3 113-60a21 21 0 000-37zm-114 64v-92l84 46zm0 0" ] []
              , Svg.path [ saFill cl, SA.d "M508 92v-1c0-4-5-40-22-59a83 83 0 00-58-26h-1c-68-5-170-6-171-6S153 1 84 6h-1-2c-11 1-34 4-55 27C9 51 4 87 4 91v1c0 1-4 42-4 83v38c0 41 4 82 4 84 0 4 5 40 22 59 20 21 44 24 57 25l5 1h2c39 4 161 6 166 6h1c1 0 103-1 171-6h3c11-1 34-4 55-26 17-19 22-55 22-59 0-2 4-43 4-84v-38c0-41-4-82-4-83zm-26 121c0 38-3 77-4 81-1 10-6 33-14 42a49 49 0 01-36 16h-3a3222 3222 0 01-332 0h-6c-11-2-27-4-39-16v-1c-8-8-13-29-14-41-1-3-4-42-4-81v-38c0-38 3-77 4-81 1-11 6-32 14-41 13-15 27-16 37-17l2-1a3233 3233 0 01337 0l3 1c9 1 24 3 37 16v1c8 8 13 30 14 41 1 3 4 43 4 81zm0 0" ] []
              ]
            )

        Icon_QRCodeSmall ->
            ( "0 0 512 512"
            , [ Svg.path [ saFill cl, SA.d "M296 286a10 10 0 100-20 10 10 0 000 20zm0 0M76 286a10 10 0 100-20 10 10 0 000 20zm0 0M10 126c6 0 10-4 10-10V20h96a10 10 0 100-20H10C4 0 0 4 0 10v106c0 6 4 10 10 10zm0 0M126 502c0-6-4-10-10-10H20v-96a10 10 0 10-20 0v106c0 6 4 10 10 10h106c6 0 10-4 10-10zm0 0M502 386c-6 0-10 4-10 10v96h-96a10 10 0 100 20h106c6 0 10-4 10-10V396c0-6-4-10-10-10zm0 0M502 0H396a10 10 0 100 20h96v96a10 10 0 1020 0V10c0-6-4-10-10-10zm0 0" ] []
              , Svg.path [ saFill cl, SA.d "M66 436c0 6 4 10 10 10h100c6 0 10-4 10-10V336c0-6-4-10-10-10H76c-6 0-10 4-10 10zm20-90h80v80H86zm0 0M176 66H76c-6 0-10 4-10 10v100c0 6 4 10 10 10h100c6 0 10-4 10-10V76c0-6-4-10-10-10zm-10 100H86V86h80zm0 0M446 76c0-6-4-10-10-10H336c-6 0-10 4-10 10v100c0 6 4 10 10 10h100c6 0 10-4 10-10zm-20 90h-80V86h80zm0 0M446 436V336c0-6-4-10-10-10H336c-6 0-10 4-10 10v100c0 6 4 10 10 10h100c6 0 10-4 10-10zm-20-10h-80v-80h80zm0 0" ] []
              , Svg.path [ saFill cl, SA.d "M136 366h-20c-6 0-10 4-10 10v20c0 6 4 10 10 10h20c6 0 10-4 10-10v-20c0-6-4-10-10-10zm0 0M116 146h20c6 0 10-4 10-10v-20c0-6-4-10-10-10h-20c-6 0-10 4-10 10v20c0 6 4 10 10 10zm0 0M376 146h20c6 0 10-4 10-10v-20c0-6-4-10-10-10h-20c-6 0-10 4-10 10v20c0 6 4 10 10 10zm0 0M376 406h20c6 0 10-4 10-10v-20c0-6-4-10-10-10h-20c-6 0-10 4-10 10v20c0 6 4 10 10 10zm0 0M106 276c0 6 4 10 10 10h130v50a10 10 0 1020 0v-60c0-6-4-10-10-10H116c-6 0-10 4-10 10zm0 0M176 246a10 10 0 100-20H76a10 10 0 100 20zm0 0M216 246h40a10 10 0 100-20h-40a10 10 0 100 20zm0 0M216 66c-6 0-10 4-10 10v100c0 6 4 10 10 10h70v50c0 6 4 10 10 10h40a10 10 0 100-20h-30v-50c0-6-4-10-10-10h-70V76c0-6-4-10-10-10zm0 0M436 226h-60a10 10 0 100 20h60a10 10 0 100-20zm0 0M436 266H336a10 10 0 100 20h100a10 10 0 100-20zm0 0M256 366h-40c-6 0-10 4-10 10v60a10 10 0 1020 0v-50h30a10 10 0 100-20zm0 0" ] []
              , Svg.path [ saFill cl, SA.d "M286 426h-30a10 10 0 100 20h40c6 0 10-4 10-10V316a10 10 0 10-20 0zm0 0M296 146c6 0 10-4 10-10V76a10 10 0 10-20 0v50h-30a10 10 0 100 20zm0 0" ] []
              ]
            )

        Icon_QRCode ->
            ( "25 25 246 246"
            , [ Svg.path [ SA.fill "rgba(0,0,0,0)", SA.d "M0 0h296v296H0z" ] []
              , Svg.defs [] [ Svg.path [ saFill cl, SA.id "a", SA.d "M0 0h8v8H0z" ] [] ]
              ]
                ++ List.map
                    (\( x, y, _ ) ->
                        Svg.use [ SA.x <| String.fromInt x, SA.y <| String.fromInt y, SA.xlinkHref <| "#a" ] []
                    )
                    qrCodeDots
            )

        Icon_QRCodeWithHole ->
            ( "25 25 246 246"
            , [ Svg.path [ SA.fill "rgba(0,0,0,0)", SA.d "M0 0h296v296H0z" ] []
              , Svg.defs [] [ Svg.path [ saFill cl, SA.id "a", SA.d "M0 0h8v8H0z" ] [] ]

              --   , Svg.defs [] [ Svg.path [ SA.fill "red", SA.id "b", SA.d "M0 0h8v8H0z" ] [] ]
              ]
                ++ List.concat
                    (List.map
                        (\( x, y, link ) ->
                            if link == "a" then
                                [ Svg.use [ SA.x <| String.fromInt x, SA.y <| String.fromInt y, SA.xlinkHref <| "#" ++ link ] [] ]

                            else
                                -- [ Svg.use [ SA.x <| String.fromInt x, SA.y <| String.fromInt y, SA.xlinkHref <| "#" ++ link ] [] ]
                                []
                        )
                        qrCodeDots
                    )
            )


qrCodeDots : List ( Int, Int, String )
qrCodeDots =
    [ ( 32, 32, "a" )
    , ( 32, 40, "a" )
    , ( 32, 48, "a" )
    , ( 32, 56, "a" )
    , ( 32, 64, "a" )
    , ( 32, 72, "a" )
    , ( 32, 80, "a" )
    , ( 32, 104, "a" )
    , ( 32, 120, "a" )
    , ( 32, 128, "a" )
    , ( 32, 176, "a" )
    , ( 32, 184, "a" )
    , ( 32, 208, "a" )
    , ( 32, 216, "a" )
    , ( 32, 224, "a" )
    , ( 32, 232, "a" )
    , ( 32, 240, "a" )
    , ( 32, 248, "a" )
    , ( 32, 256, "a" )
    , ( 40, 32, "a" )
    , ( 40, 80, "a" )
    , ( 40, 104, "a" )
    , ( 40, 120, "a" )
    , ( 40, 128, "a" )
    , ( 40, 136, "a" )
    , ( 40, 144, "a" )
    , ( 40, 160, "a" )
    , ( 40, 168, "a" )
    , ( 40, 176, "a" )
    , ( 40, 184, "a" )
    , ( 40, 208, "a" )
    , ( 40, 256, "a" )
    , ( 48, 32, "a" )
    , ( 48, 48, "a" )
    , ( 48, 56, "a" )
    , ( 48, 64, "a" )
    , ( 48, 80, "a" )
    , ( 48, 104, "a" )
    , ( 48, 112, "a" )
    , ( 48, 120, "a" )
    , ( 48, 136, "a" )
    , ( 48, 176, "a" )
    , ( 48, 184, "a" )
    , ( 48, 208, "a" )
    , ( 48, 224, "a" )
    , ( 48, 232, "a" )
    , ( 48, 240, "a" )
    , ( 48, 256, "a" )
    , ( 56, 32, "a" )
    , ( 56, 48, "a" )
    , ( 56, 56, "a" )
    , ( 56, 64, "a" )
    , ( 56, 80, "a" )
    , ( 56, 112, "a" )
    , ( 56, 120, "a" )
    , ( 56, 128, "a" )
    , ( 56, 136, "a" )
    , ( 56, 144, "a" )
    , ( 56, 152, "a" )
    , ( 56, 168, "a" )
    , ( 56, 176, "a" )
    , ( 56, 184, "a" )
    , ( 56, 208, "a" )
    , ( 56, 224, "a" )
    , ( 56, 232, "a" )
    , ( 56, 240, "a" )
    , ( 56, 256, "a" )
    , ( 64, 32, "a" )
    , ( 64, 48, "a" )
    , ( 64, 56, "a" )
    , ( 64, 64, "a" )
    , ( 64, 80, "a" )
    , ( 64, 96, "a" )
    , ( 64, 104, "a" )
    , ( 64, 120, "a" )
    , ( 64, 144, "a" )
    , ( 64, 168, "a" )
    , ( 64, 184, "a" )
    , ( 64, 192, "a" )
    , ( 64, 208, "a" )
    , ( 64, 224, "a" )
    , ( 64, 232, "a" )
    , ( 64, 240, "a" )
    , ( 64, 256, "a" )
    , ( 72, 32, "a" )
    , ( 72, 80, "a" )
    , ( 72, 96, "a" )
    , ( 72, 120, "a" )
    , ( 72, 128, "a" )
    , ( 72, 176, "a" )
    , ( 72, 184, "a" )
    , ( 72, 192, "a" )
    , ( 72, 208, "a" )
    , ( 72, 256, "a" )
    , ( 80, 32, "a" )
    , ( 80, 40, "a" )
    , ( 80, 48, "a" )
    , ( 80, 56, "a" )
    , ( 80, 64, "a" )
    , ( 80, 72, "a" )
    , ( 80, 80, "a" )
    , ( 80, 96, "a" )
    , ( 80, 112, "a" )
    , ( 80, 128, "a" )
    , ( 80, 144, "a" )
    , ( 80, 160, "a" )
    , ( 80, 176, "a" )
    , ( 80, 192, "a" )
    , ( 80, 208, "a" )
    , ( 80, 216, "a" )
    , ( 80, 224, "a" )
    , ( 80, 232, "a" )
    , ( 80, 240, "a" )
    , ( 80, 248, "a" )
    , ( 80, 256, "a" )
    , ( 88, 96, "a" )
    , ( 88, 120, "a" )
    , ( 88, 136, "a" )
    , ( 88, 144, "a" )
    , ( 88, 152, "a" )
    , ( 88, 160, "a" )
    , ( 88, 168, "a" )
    , ( 88, 192, "a" )
    , ( 96, 40, "a" )
    , ( 96, 72, "a" )
    , ( 96, 80, "a" )
    , ( 96, 88, "a" )
    , ( 96, 160, "b" )
    , ( 96, 200, "a" )
    , ( 96, 208, "a" )
    , ( 96, 216, "a" )
    , ( 96, 224, "a" )
    , ( 104, 32, "a" )
    , ( 104, 40, "a" )
    , ( 104, 48, "a" )
    , ( 104, 56, "a" )
    , ( 104, 64, "a" )
    , ( 104, 88, "a" )
    , ( 104, 96, "a" )
    , ( 104, 112, "a" )
    , ( 104, 120, "a" )
    , ( 104, 128, "b" )
    , ( 104, 136, "b" )
    , ( 104, 168, "a" )
    , ( 104, 176, "a" )
    , ( 104, 192, "a" )
    , ( 104, 200, "a" )
    , ( 104, 208, "a" )
    , ( 104, 240, "a" )
    , ( 104, 248, "a" )
    , ( 104, 256, "a" )
    , ( 112, 32, "a" )
    , ( 112, 48, "a" )
    , ( 112, 56, "a" )
    , ( 112, 80, "a" )
    , ( 112, 88, "a" )
    , ( 112, 96, "a" )
    , ( 112, 128, "b" )
    , ( 112, 160, "b" )
    , ( 112, 168, "b" )
    , ( 112, 184, "a" )
    , ( 112, 192, "a" )
    , ( 112, 200, "a" )
    , ( 112, 208, "a" )
    , ( 112, 224, "a" )
    , ( 112, 232, "a" )
    , ( 112, 248, "a" )
    , ( 120, 32, "a" )
    , ( 120, 48, "a" )
    , ( 120, 64, "a" )
    , ( 120, 104, "a" )
    , ( 120, 112, "a" )
    , ( 120, 120, "b" )
    , ( 120, 136, "b" )
    , ( 120, 144, "b" )
    , ( 120, 160, "b" )
    , ( 120, 168, "b" )
    , ( 120, 176, "b" )
    , ( 120, 184, "a" )
    , ( 120, 192, "a" )
    , ( 120, 200, "a" )
    , ( 120, 208, "a" )
    , ( 120, 232, "a" )
    , ( 120, 240, "a" )
    , ( 128, 32, "a" )
    , ( 128, 56, "a" )
    , ( 128, 64, "a" )
    , ( 128, 72, "a" )
    , ( 128, 80, "a" )
    , ( 128, 88, "a" )
    , ( 128, 96, "a" )
    , ( 128, 104, "a" )
    , ( 128, 120, "b" )
    , ( 128, 144, "b" )
    , ( 128, 152, "b" )
    , ( 128, 184, "a" )
    , ( 128, 208, "a" )
    , ( 128, 216, "a" )
    , ( 128, 224, "a" )
    , ( 128, 240, "a" )
    , ( 128, 248, "a" )
    , ( 136, 40, "a" )
    , ( 136, 56, "a" )
    , ( 136, 96, "a" )
    , ( 136, 128, "b" )
    , ( 136, 144, "b" )
    , ( 136, 168, "b" )
    , ( 136, 200, "a" )
    , ( 136, 216, "a" )
    , ( 136, 224, "a" )
    , ( 136, 232, "a" )
    , ( 136, 256, "a" )
    , ( 144, 32, "a" )
    , ( 144, 40, "a" )
    , ( 144, 56, "a" )
    , ( 144, 72, "a" )
    , ( 144, 80, "a" )
    , ( 144, 88, "a" )
    , ( 144, 96, "a" )
    , ( 144, 112, "b" )
    , ( 144, 128, "b" )
    , ( 144, 136, "b" )
    , ( 144, 144, "b" )
    , ( 144, 152, "b" )
    , ( 144, 168, "b" )
    , ( 144, 176, "b" )
    , ( 144, 200, "a" )
    , ( 144, 216, "a" )
    , ( 144, 232, "a" )
    , ( 144, 240, "a" )
    , ( 144, 248, "a" )
    , ( 144, 256, "a" )
    , ( 152, 32, "a" )
    , ( 152, 48, "a" )
    , ( 152, 56, "a" )
    , ( 152, 72, "a" )
    , ( 152, 104, "a" )
    , ( 152, 184, "a" )
    , ( 152, 192, "a" )
    , ( 152, 200, "a" )
    , ( 152, 208, "a" )
    , ( 152, 232, "a" )
    , ( 152, 240, "a" )
    , ( 152, 256, "a" )
    , ( 160, 32, "a" )
    , ( 160, 40, "a" )
    , ( 160, 48, "a" )
    , ( 160, 56, "a" )
    , ( 160, 64, "a" )
    , ( 160, 80, "a" )
    , ( 160, 88, "a" )
    , ( 160, 104, "a" )
    , ( 160, 120, "b" )
    , ( 160, 128, "b" )
    , ( 160, 136, "b" )
    , ( 160, 160, "b" )
    , ( 160, 192, "a" )
    , ( 160, 208, "a" )
    , ( 160, 216, "a" )
    , ( 160, 224, "a" )
    , ( 160, 256, "a" )
    , ( 168, 32, "a" )
    , ( 168, 48, "a" )
    , ( 168, 64, "a" )
    , ( 168, 72, "a" )
    , ( 168, 120, "b" )
    , ( 168, 144, "b" )
    , ( 168, 152, "b" )
    , ( 168, 160, "b" )
    , ( 168, 176, "b" )
    , ( 168, 184, "a" )
    , ( 168, 208, "a" )
    , ( 168, 216, "a" )
    , ( 176, 48, "a" )
    , ( 176, 56, "a" )
    , ( 176, 64, "a" )
    , ( 176, 80, "a" )
    , ( 176, 104, "a" )
    , ( 176, 112, "a" )
    , ( 176, 120, "b" )
    , ( 176, 128, "b" )
    , ( 176, 152, "b" )
    , ( 176, 160, "b" )
    , ( 176, 176, "a" )
    , ( 176, 184, "a" )
    , ( 176, 216, "a" )
    , ( 176, 256, "a" )
    , ( 184, 32, "a" )
    , ( 184, 40, "a" )
    , ( 184, 72, "a" )
    , ( 184, 104, "a" )
    , ( 184, 112, "a" )
    , ( 184, 120, "a" )
    , ( 184, 160, "b" )
    , ( 184, 168, "a" )
    , ( 184, 184, "a" )
    , ( 184, 200, "a" )
    , ( 184, 208, "a" )
    , ( 184, 216, "a" )
    , ( 184, 224, "a" )
    , ( 184, 240, "a" )
    , ( 184, 256, "a" )
    , ( 192, 32, "a" )
    , ( 192, 72, "a" )
    , ( 192, 80, "a" )
    , ( 192, 88, "a" )
    , ( 192, 96, "a" )
    , ( 192, 120, "a" )
    , ( 192, 128, "a" )
    , ( 192, 144, "b" )
    , ( 192, 152, "b" )
    , ( 192, 160, "b" )
    , ( 192, 168, "a" )
    , ( 192, 176, "a" )
    , ( 192, 184, "a" )
    , ( 192, 192, "a" )
    , ( 192, 200, "a" )
    , ( 192, 208, "a" )
    , ( 192, 216, "a" )
    , ( 192, 224, "a" )
    , ( 192, 240, "a" )
    , ( 192, 248, "a" )
    , ( 192, 256, "a" )
    , ( 200, 104, "a" )
    , ( 200, 112, "a" )
    , ( 200, 120, "a" )
    , ( 200, 144, "a" )
    , ( 200, 152, "a" )
    , ( 200, 160, "a" )
    , ( 200, 192, "a" )
    , ( 200, 224, "a" )
    , ( 200, 240, "a" )
    , ( 200, 256, "a" )
    , ( 208, 32, "a" )
    , ( 208, 40, "a" )
    , ( 208, 48, "a" )
    , ( 208, 56, "a" )
    , ( 208, 64, "a" )
    , ( 208, 72, "a" )
    , ( 208, 80, "a" )
    , ( 208, 96, "a" )
    , ( 208, 104, "a" )
    , ( 208, 136, "a" )
    , ( 208, 144, "a" )
    , ( 208, 168, "a" )
    , ( 208, 192, "a" )
    , ( 208, 208, "a" )
    , ( 208, 224, "a" )
    , ( 208, 248, "a" )
    , ( 208, 256, "a" )
    , ( 216, 32, "a" )
    , ( 216, 80, "a" )
    , ( 216, 96, "a" )
    , ( 216, 104, "a" )
    , ( 216, 128, "a" )
    , ( 216, 152, "a" )
    , ( 216, 168, "a" )
    , ( 216, 176, "a" )
    , ( 216, 192, "a" )
    , ( 216, 224, "a" )
    , ( 216, 232, "a" )
    , ( 216, 248, "a" )
    , ( 224, 32, "a" )
    , ( 224, 48, "a" )
    , ( 224, 56, "a" )
    , ( 224, 64, "a" )
    , ( 224, 80, "a" )
    , ( 224, 104, "a" )
    , ( 224, 112, "a" )
    , ( 224, 120, "a" )
    , ( 224, 136, "a" )
    , ( 224, 144, "a" )
    , ( 224, 168, "a" )
    , ( 224, 176, "a" )
    , ( 224, 184, "a" )
    , ( 224, 192, "a" )
    , ( 224, 200, "a" )
    , ( 224, 208, "a" )
    , ( 224, 216, "a" )
    , ( 224, 224, "a" )
    , ( 224, 256, "a" )
    , ( 232, 32, "a" )
    , ( 232, 48, "a" )
    , ( 232, 56, "a" )
    , ( 232, 64, "a" )
    , ( 232, 80, "a" )
    , ( 232, 104, "a" )
    , ( 232, 120, "a" )
    , ( 232, 128, "a" )
    , ( 232, 152, "a" )
    , ( 232, 168, "a" )
    , ( 232, 176, "a" )
    , ( 232, 184, "a" )
    , ( 232, 192, "a" )
    , ( 232, 216, "a" )
    , ( 232, 256, "a" )
    , ( 240, 32, "a" )
    , ( 240, 48, "a" )
    , ( 240, 56, "a" )
    , ( 240, 64, "a" )
    , ( 240, 80, "a" )
    , ( 240, 104, "a" )
    , ( 240, 136, "a" )
    , ( 240, 168, "a" )
    , ( 240, 200, "a" )
    , ( 240, 240, "a" )
    , ( 248, 32, "a" )
    , ( 248, 80, "a" )
    , ( 248, 96, "a" )
    , ( 248, 104, "a" )
    , ( 248, 120, "a" )
    , ( 248, 136, "a" )
    , ( 248, 192, "a" )
    , ( 248, 216, "a" )
    , ( 248, 232, "a" )
    , ( 248, 240, "a" )
    , ( 248, 248, "a" )
    , ( 248, 256, "a" )
    , ( 256, 32, "a" )
    , ( 256, 40, "a" )
    , ( 256, 48, "a" )
    , ( 256, 56, "a" )
    , ( 256, 64, "a" )
    , ( 256, 72, "a" )
    , ( 256, 80, "a" )
    , ( 256, 104, "a" )
    , ( 256, 112, "a" )
    , ( 256, 120, "a" )
    , ( 256, 128, "a" )
    , ( 256, 136, "a" )
    , ( 256, 144, "a" )
    , ( 256, 152, "a" )
    , ( 256, 168, "a" )
    , ( 256, 176, "a" )
    , ( 256, 184, "a" )
    , ( 256, 200, "a" )
    , ( 256, 208, "a" )
    , ( 256, 224, "a" )
    , ( 256, 240, "a" )
    , ( 256, 248, "a" )
    ]
