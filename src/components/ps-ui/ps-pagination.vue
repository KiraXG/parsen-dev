<template>
    <el-pagination
        :background="true"
        :current-page="pageConfig.pageNum"
        :page-size="pageConfig.pageSize"
        :page-sizes="[10, 20, 30, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
    >
    </el-pagination>
</template>

<script setup lang="ts" name="Pagination">
interface pageConfig {
    pageNum: number
    pageSize: number
}
interface PaginationProps {
    pageConfig: pageConfig
    total: number
    handleSizeChange: (size: number) => void
    handleCurrentChange: (currentPage: number) => void
}

defineProps<PaginationProps>()
</script>

<style lang="scss" scoped></style>
