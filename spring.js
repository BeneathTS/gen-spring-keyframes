const { writeFileSync } = require('fs')
const path = require('path')

const { camelCase } = require('lodash')

const inputData = { path: '' }

const getInputData = () => {
    let inputValue

    for (let i = 2; process.argv[i]; i += 1) {

        inputValue = process.argv[i].split('=')

        if (isFinite(inputValue[1])) {
            inputData[inputValue[0]] = Number(inputValue[1])

        } else if (inputValue[1] === 'no') {
            inputData[inputValue[0]] = false

        } else {
            inputData[inputValue[0]] = inputValue[1]
        }
    }
}

const expanent = 2.71828

const getDiscriminant = (a, b, c) => (b * b) - (4 * a * c)

const solveEquationWithComplexNumber = (t, friction, discriminant) => {
    const expanentPow = -(friction / 2) * t
    const firstConst = -1
    const secondConst = -(friction / discriminant)

    return (firstConst * Math.pow(expanent, expanentPow) * Math.cos((discriminant / 2) * t)) + (secondConst * Math.pow(expanent, expanentPow) * Math.sin((discriminant / 2) * t)) + 1
}

const solveEquationWithTwoRoots = (t, roots) => {
    const expanentPowFirst = roots.x1 * t
    const expanentPowSecond = roots.x2 * t
    const firstConst = -(roots.x2 / (roots.x1 - roots.x2)) - 1
    const secondConst = roots.x2 / (roots.x1 - roots.x2)

    return (firstConst * Math.pow(expanent, expanentPowFirst)) + (secondConst * Math.pow(expanent, expanentPowSecond)) + 1
}

const solveEquationWithOneRoot = (t, root) => {
    const expanentPow = root * t
    const firstConst = -1
    const secondConst = -1

    return ((firstConst + (secondConst * t)) * Math.pow(expanent, expanentPow)) + 1
}

const solveDifferentialEquation = (tension, friction, t) => {
    let discriminant = getDiscriminant(1, friction, tension)
    const roots = {
        x1: (-friction + Math.sqrt(discriminant)) / 2,
        x2: (-friction - Math.sqrt(discriminant)) / 2,
    }

    if (discriminant < 0) {
        discriminant = Math.abs(discriminant)
        return solveEquationWithComplexNumber(t, friction, Math.sqrt(discriminant))
    } else if (discriminant === 0) {
        return solveEquationWithOneRoot(t, roots.x1)
    }
    return solveEquationWithTwoRoots(t, roots)
}

const solveLinearInterpolationEquation = (start, end, value, float, precision) => {
    const lerp = start + (value * (end - start))

    return float ? lerp.toFixed(precision) : Math.round(lerp)
}

const generateAnimationKeyframes = ({
    start = 0,
    end = 0,
    tension = 400,
    friction = 12,
    transformFnc = '',
    additionalFnc = '',
    unit = '',
    float = false,
    precision = 10,
    skipSameFrames = true,
    cropGraph = 1,
}) => {
    let animationKeyframes = ''
    let elementPosition = 0
    let oldPosition
    let t = 0
    let p = 0

    for (let i = 0; i <= 100; i += 1) {

        t = i / (cropGraph * 100)
        p = solveDifferentialEquation(tension, friction, t)
        elementPosition = solveLinearInterpolationEquation(start, end, p, float, precision)

        if (!skipSameFrames || elementPosition !== oldPosition || i === 100) {
            animationKeyframes += (
                additionalFnc
                    ? `    ${i}% { ${transformFnc}: ${additionalFnc}(${elementPosition}${unit}) }\n`
                    : `    ${i}% { ${transformFnc}: ${elementPosition}${unit} }\n`
            )
        }

        oldPosition = elementPosition
    }

    return animationKeyframes
}

getInputData()

const setupImport = 'import { keyframes } from \'@emotion/react\'\n\n'
const animationName = camelCase(path.basename(inputData.path))

const generateAnimation = () => `${setupImport}export const ${animationName} = keyframes\`\n${generateAnimationKeyframes(inputData)}\`\n`

writeFileSync(`src/${inputData.path}.keyframe.js`, generateAnimation(), 'utf-8')
