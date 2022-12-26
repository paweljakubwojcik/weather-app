import { StatusBar } from 'expo-status-bar'
import { forwardRef, useCallback, useRef, useState } from 'react'
import {
    RefreshControl,
    ScrollView,
    Text,
    View,
    Animated,
    Easing,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native'
import { Clock } from 'components/clock'
import { DegreeSymbol } from 'components/degree-symbol'

const wait = (timeout: number) => {
    return new Promise((resolve) => setTimeout(resolve, timeout))
}

/**
 *
 * @param value - value to check
 * @param checkOne - first option
 * @param checkTwo - second option
 * @returns checkOne | checkTwo - returns check that is closest to provided value
 */
const getCloser = (value: number, checkOne: number, checkTwo: number) =>
    Math.abs(value - checkOne) < Math.abs(value - checkTwo) ? checkOne : checkTwo

const MAX_HEADER_HEIGHT = 150
const MIN_HEADER_HEIGHT = 60
const MAX_SCROLL = MAX_HEADER_HEIGHT - MIN_HEADER_HEIGHT
const MIN_SCROLL = 0
const TRANSLATE_TEXT_X_MAX = 80

const PADDING_UNFOLDED = 5
const PADDING_FOLDED = 0

export default function App() {
    const [refreshing, setRefreshing] = useState(false)

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        wait(2000).then(() => setRefreshing(false))
    }, [])

    const scrollY = useRef(new Animated.Value(0))

    const scrollYNumber = useRef<number>(0)

    scrollY.current.addListener(({ value }) => {
        scrollYNumber.current = value
    })

    const translateTextY = scrollY.current.interpolate({
        inputRange: [0, MAX_SCROLL],
        outputRange: [MAX_HEADER_HEIGHT - 60, 0],
        extrapolate: 'clamp',
    })

    const translateTextX = scrollY.current.interpolate({
        inputRange: [0, MAX_SCROLL],
        outputRange: [PADDING_UNFOLDED, TRANSLATE_TEXT_X_MAX],
        extrapolate: 'clamp',
    })

    const translateContentLeftX = scrollY.current.interpolate({
        inputRange: [0, MAX_SCROLL],
        outputRange: [PADDING_UNFOLDED, PADDING_FOLDED],
        extrapolate: 'clamp',
    })

    const translateContentLeftY = scrollY.current.interpolate({
        inputRange: [0, MAX_SCROLL],
        outputRange: [PADDING_UNFOLDED, PADDING_FOLDED],
        extrapolate: 'clamp',
    })

    const translateLocationY = scrollY.current.interpolate({
        inputRange: [0, MAX_SCROLL],
        outputRange: [0, -30],
        extrapolate: 'clamp',
    })

    const localizationOpacity = scrollY.current.interpolate({
        inputRange: [0, MAX_SCROLL / 2],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    })

    const handleScroll = Animated.event(
        [
            {
                nativeEvent: {
                    contentOffset: { y: scrollY.current },
                },
            },
        ],
        {
            useNativeDriver: true,
        }
    )

    const scrollViewRef = useRef<ScrollView>()

    const handleSnap = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = nativeEvent.contentOffset.y
        if (offsetY > 0 && offsetY < MAX_SCROLL) {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({
                    y: getCloser(offsetY, 0, MAX_SCROLL),
                    animated: true,
                })
            }
        }
    }

    return (
        <View className="flex-1 p-8 mt-5 bg-gray-700 text-white items-center">
            <Animated.View className="absolute w-full z-10">
                <Animated.View className="mt-6 flex justify-center w-full bg-gray-700">
                    <Animated.Text
                        className="text-white text-7xl mr-2"
                        style={[
                            {
                                transform: [
                                    { translateX: translateContentLeftX },
                                    { translateY: translateContentLeftY },
                                ],
                            },
                        ]}
                    >
                        8<DegreeSymbol />
                    </Animated.Text>
                    <Animated.View
                        className="absolute left-0"
                        style={[{ transform: [{ translateX: translateTextX }, { translateY: translateTextY }] }]}
                    >
                        <Text className="text-white text-md">
                            6<DegreeSymbol /> / 10
                            <DegreeSymbol />
                        </Text>
                        <Clock />
                    </Animated.View>
                </Animated.View>
                <Animated.Text
                    className="text-white text-2xl mr-2"
                    style={[
                        {
                            transform: [{ translateY: translateLocationY }, { translateX: PADDING_UNFOLDED }],
                        },
                        {
                            opacity: localizationOpacity,
                        },
                    ]}
                >
                    Lokalizacja
                </Animated.Text>
            </Animated.View>
            {/* This is short list, all of which should be rendered immediately thus - ScrollView instead of FlatList  */}
            <Animated.ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                onScroll={handleScroll}
                contentContainerStyle={{
                    paddingTop: MAX_HEADER_HEIGHT,
                }}
                onMomentumScrollEnd={handleSnap}
                ref={scrollViewRef}
                className="w-full"
            >
                <View className="w-full h-[300px] my-2 bg-slate-50/5 rounded-md p-2">
                    <Text className="text-white">Here will sit temperature plots</Text>
                </View>
                <View className="w-full h-[300px] my-2 bg-slate-50/5 rounded-md p-2">
                    <Text className="text-white">Here will sit temperature plots</Text>
                </View>
            </Animated.ScrollView>
            <StatusBar style="auto" />
        </View>
    )
}
