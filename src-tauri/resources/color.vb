Sub MarkColor()
    Dim currentRow As Long
    Dim startCol As Integer
    Dim endCol As Integer
    Dim keyCol As Integer
    Dim endRow As Integer
    startCol = 1                    '表格开始列
    endCol = 6                      '表格结束列
    keyCol = 3                      '关键字所在列
    endRow = Range("A" & Rows.Count).End(xlUp).Row

    '设置表格文字为宋体
    Range("A1:F" & endRow).Select
    With Selection.Font
        .Name = "宋体"
        .Size = 11
        .Strikethrough = False
        .Superscript = False
        .Subscript = False
        .OutlineFont = False
        .Shadow = False
        .Underline = xlUnderlineStyleNone
        .TintAndShade = 0
        .ThemeFont = xlThemeFontNone
    End With

    '自动调整列宽
    Cells.EntireColumn.ColumnWidth = 8.11
    Cells.EntireColumn.AutoFit

    '文字居中
    Range("A1:F" & endRow).Select
    With Selection
        .HorizontalAlignment = xlCenter
        .VerticalAlignment = xlCenter
        .WrapText = False
        .Orientation = 0
        .AddIndent = False
        .IndentLevel = 0
        .ShrinkToFit = False
        .ReadingOrder = xlContext
        .MergeCells = False
    End With

    '设置表格边框
    Range("A1:F" & endRow).Select
    Selection.Borders(xlDiagonalDown).LineStyle = xlNone
    Selection.Borders(xlDiagonalUp).LineStyle = xlNone
    With Selection.Borders(xlEdgeLeft)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlThin
    End With
    With Selection.Borders(xlEdgeTop)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlThin
    End With
    With Selection.Borders(xlEdgeBottom)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlThin
    End With
    With Selection.Borders(xlEdgeRight)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlThin
    End With
    With Selection.Borders(xlInsideVertical)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlThin
    End With
    With Selection.Borders(xlInsideHorizontal)
        .LineStyle = xlContinuous
        .ColorIndex = 0
        .TintAndShade = 0
        .Weight = xlThin
    End With

    '首行冻结
    With ActiveWindow
        .SplitColumn = 0
        .SplitRow = 1
    End With
    ActiveWindow.FreezePanes = True

    '设置表头
    Range("A1:F1").Select
    With Selection.Interior
        .Pattern = xlSolid
        .PatternColorIndex = xlAutomatic
        .ThemeColor = xlThemeColorAccent6
        .TintAndShade = -0.249977111117893
        .PatternTintAndShade = 0
    End With
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Selection.Font.Bold = True
    Rows("1:1").RowHeight = 21.8

    '间隔着色
    For currentRow = 2 To 2000
        If Trim(Cells(currentRow, startCol).Value) <> "" Then
            sRng = Cells(currentRow, startCol).Address & ":" & Cells(currentRow, endCol).Address
            If Trim(Cells(currentRow, keyCol).Value) = Trim(Cells(currentRow - 1, keyCol).Value) Then
                Range(sRng).Select
                If currentRow = 2 Then
                    Selection.Interior.Color = RGB(255, 255, 255)
                Else
                    Selection.Interior.Color = Cells(currentRow - 1, startCol).Interior.Color
                End If
            Else
                Range(sRng).Select
                If Cells(currentRow - 1, startCol).Interior.Color = RGB(255, 255, 255) Then
                    Selection.Interior.Color = RGB(226, 239, 218)
                Else
                    Selection.Interior.Color = RGB(255, 255, 255)
                End If
            End If
        Else
            Exit For
        End If
    Next
End Sub
