import { minutesToMilliseconds, format } from 'date-fns'
import React, { useState, useEffect } from 'react'
import { Text } from 'react-native'

export const Clock = () => {
    const [currentDate, setCurrentDate] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDate(new Date())
        }, minutesToMilliseconds(0.1))
        return () => clearInterval(interval)
    }, [])

    return (
        <>
            <Text className="text-white text-md">{format(currentDate, 'eee, hh:mm')}</Text>
        </>
    )
}
